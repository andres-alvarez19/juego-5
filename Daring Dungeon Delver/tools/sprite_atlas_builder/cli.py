"""
Sprite Atlas Builder - Mini proyecto para normalizar sprites y unificar
todas las animaciones de una entidad en un solo atlas.

Flujo:
1) El usuario elige una carpeta de sprites (por ejemplo, entities/enemies).
2) Se muestra una lista de PNGs y se seleccionan con las flechas + barra espaciadora.
   - Enter confirma la selección.
3) Para cada imagen seleccionada, el usuario indica a qué animación corresponde
   (por ejemplo: orc_idle, orc_walk, orc_attack).
4) El script detecta automáticamente los frames reales (columnas con píxeles),
   recorta el contenido, calcula un tamaño de tile único para todos los frames
   y genera:
   - public/assets/atlas/<atlas_key>.png
   - public/assets/atlas/<atlas_key>.json

Los nombres de frames en el atlas siguen el patrón:
    <animation_name>_<index>

De esta forma, el juego puede usar:
    scene.load.atlas('<atlas_key>', 'atlas/<atlas_key>.png', 'atlas/<atlas_key>.json')
    scene.anims.generateFrameNames('<atlas_key>', { prefix: '<animation_name>_', ... })
"""

from __future__ import annotations

import curses
import json
import os
from typing import Dict, List, Tuple

from PIL import Image


# Estructura esperada:
#   <repo_root>/Daring Dungeon Delver/tools/sprite_atlas_builder/cli.py
# Queremos que ROOT_DIR sea "<repo_root>/Daring Dungeon Delver"
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ASSETS_DIR = os.path.join(ROOT_DIR, "public", "assets")
ATLAS_DIR = os.path.join(ASSETS_DIR, "atlas")


def find_content_segments(img: Image.Image, alpha_threshold: int = 0) -> List[Tuple[int, int]]:
    """Devuelve segmentos horizontales [x_start, x_end] con píxeles no transparentes."""
    img_rgba = img.convert("RGBA")
    width, height = img_rgba.size

    has_content = [False] * width

    for x in range(width):
        for y in range(height):
            _, _, _, a = img_rgba.getpixel((x, y))
            if a > alpha_threshold:
                has_content[x] = True
                break

    segments: List[Tuple[int, int]] = []
    inside = False
    start = 0

    for x, filled in enumerate(has_content):
        if filled and not inside:
            inside = True
            start = x
        elif not filled and inside:
            inside = False
            segments.append((start, x - 1))

    if inside:
        segments.append((start, width - 1))

    return segments


def select_files_with_curses(files: List[str]) -> List[str]:
    """UI mínima con curses para seleccionar ficheros con flechas + espacio."""

    def _ui(stdscr) -> List[str]:
        curses.curs_set(0)
        current = 0
        selected = [False] * len(files)

        while True:
            stdscr.clear()
            stdscr.addstr(
                0,
                0,
                "Selecciona imágenes con ↑/↓, espacio para marcar, Enter para continuar",
            )

            max_y, max_x = stdscr.getmaxyx()
            visible_rows = max_y - 3
            start = max(0, current - visible_rows // 2)
            end = min(len(files), start + visible_rows)

            for idx in range(start, end):
                name = files[idx]
                marker = "[x]" if selected[idx] else "[ ]"
                line = f" {marker} {name}"
                row = idx - start + 2
                if idx == current:
                    stdscr.attron(curses.A_REVERSE)
                    stdscr.addstr(row, 0, line[: max_x - 1])
                    stdscr.attroff(curses.A_REVERSE)
                else:
                    stdscr.addstr(row, 0, line[: max_x - 1])

            key = stdscr.getch()

            if key in (curses.KEY_UP, ord("k")):
                current = (current - 1) % len(files)
            elif key in (curses.KEY_DOWN, ord("j")):
                current = (current + 1) % len(files)
            elif key == ord(" "):
                selected[current] = not selected[current]
            elif key in (curses.KEY_ENTER, 10, 13):
                break

        return [f for i, f in enumerate(files) if selected[i]]

    if not files:
        return []

    return curses.wrapper(_ui)


def list_sprite_dirs(base_dir: str) -> List[str]:
    """
    Devuelve una lista de directorios (rutas relativas a base_dir)
    que contienen al menos un PNG. Sirve como candidatos para
    seleccionar el directorio de sprites de la entidad.
    """
    dirs: List[str] = []
    for root, _, files in os.walk(base_dir):
        if any(f.lower().endswith(".png") for f in files):
            rel = os.path.relpath(root, base_dir)
            dirs.append("." if rel == "." else rel.replace("\\", "/"))
    return sorted(set(dirs))


def select_directory_with_curses(dirs: List[str]) -> str | None:
    """UI con curses para elegir un directorio de una lista."""

    def _ui(stdscr) -> str | None:
        curses.curs_set(0)
        current = 0

        while True:
            stdscr.clear()
            stdscr.addstr(
                0,
                0,
                "Selecciona directorio con ↑/↓, Enter para confirmar, q para cancelar",
            )

            max_y, max_x = stdscr.getmaxyx()
            visible_rows = max_y - 3
            start = max(0, current - visible_rows // 2)
            end = min(len(dirs), start + visible_rows)

            for idx in range(start, end):
                name = dirs[idx]
                prefix = "> " if idx == current else "  "
                line = f"{prefix}{name}"
                row = idx - start + 2
                if idx == current:
                    stdscr.attron(curses.A_REVERSE)
                    stdscr.addstr(row, 0, line[: max_x - 1])
                    stdscr.attroff(curses.A_REVERSE)
                else:
                    stdscr.addstr(row, 0, line[: max_x - 1])

            key = stdscr.getch()

            if key in (curses.KEY_UP, ord("k")):
                current = (current - 1) % len(dirs)
            elif key in (curses.KEY_DOWN, ord("j")):
                current = (current + 1) % len(dirs)
            elif key in (curses.KEY_ENTER, 10, 13):
                return dirs[current]
            elif key in (ord("q"), 27):  # q o ESC
                return None

    if not dirs:
        return None

    return curses.wrapper(_ui)


def build_frames_per_animation(
    base_dir: str,
    selected_files: List[str],
    anim_names: Dict[str, str],
) -> Dict[str, List[Image.Image]]:
    """
    Para cada archivo seleccionado, detecta segmentos y genera frames recortados.

    Devuelve un dict:
        { animation_name: [frame_img1, frame_img2, ...] }
    """
    anim_frames: Dict[str, List[Image.Image]] = {}

    for filename in selected_files:
        anim_name = anim_names[filename]
        path = os.path.join(base_dir, filename)
        img = Image.open(path).convert("RGBA")
        width, height = img.size

        segments = find_content_segments(img)
        if not segments:
            print(f"[INFO] {filename}: sin segmentos con contenido, se omite.")
            continue

        frames_list = anim_frames.setdefault(anim_name, [])

        for xs, xe in segments:
            margin = 1
            left = max(0, xs - margin)
            right = min(width, xe + margin)

            band = img.crop((left, 0, right + 1, height))
            bbox = band.getbbox()
            if not bbox:
                continue

            frame_raw = band.crop(bbox)
            if frame_raw.width == 0 or frame_raw.height == 0:
                continue

            frames_list.append(frame_raw)

    return anim_frames


def compute_tile_size(anim_frames: Dict[str, List[Image.Image]]) -> int:
    """Calcula el tamaño de tile uniforme para todos los frames."""
    max_dim = 0
    for frames in anim_frames.values():
        for frame in frames:
            max_dim = max(max_dim, frame.width, frame.height)

    if max_dim <= 0:
        raise ValueError("No se pudieron calcular dimensiones de frames.")

    return max_dim


def normalize_frames(
    anim_frames: Dict[str, List[Image.Image]],
    tile_size: int,
) -> Dict[str, List[Image.Image]]:
    """
    Escala y centra todos los frames para que queden en tiles tile_size x tile_size.
    """
    normalized: Dict[str, List[Image.Image]] = {}

    for anim_name, frames in anim_frames.items():
        out_list: List[Image.Image] = []
        for frame_raw in frames:
            fw, fh = frame_raw.size
            scale_factor = tile_size / max(fw, fh)
            new_w = max(1, int(fw * scale_factor))
            new_h = max(1, int(fh * scale_factor))
            frame_scaled = frame_raw.resize((new_w, new_h), Image.NEAREST)

            tile = Image.new("RGBA", (tile_size, tile_size), (0, 0, 0, 0))
            offset_x = (tile_size - new_w) // 2
            offset_y = (tile_size - new_h) // 2
            tile.paste(frame_scaled, (offset_x, offset_y))

            out_list.append(tile)
        normalized[anim_name] = out_list

    return normalized


def build_atlas(
    atlas_key: str,
    normalized_frames: Dict[str, List[Image.Image]],
    tile_size: int,
) -> Tuple[Image.Image, dict]:
    """
    Construye la imagen atlas y el JSON de metadatos.
    Frame names: <anim_name>_<index>.
    """
    anim_order = list(normalized_frames.keys())
    total_frames = sum(len(normalized_frames[a]) for a in anim_order)
    if total_frames == 0:
        raise ValueError("No hay frames normalizados para construir el atlas.")

    sheet_width = tile_size * total_frames
    sheet_height = tile_size
    sheet = Image.new("RGBA", (sheet_width, sheet_height), (0, 0, 0, 0))

    frames_meta: Dict[str, dict] = {}
    x = 0

    for anim_name in anim_order:
        frames = normalized_frames[anim_name]
        for idx, frame in enumerate(frames):
            sheet.paste(frame, (x, 0))
            frame_key = f"{anim_name}_{idx}"

            frames_meta[frame_key] = {
                "frame": {"x": x, "y": 0, "w": tile_size, "h": tile_size},
                "rotated": False,
                "trimmed": False,
                "spriteSourceSize": {"x": 0, "y": 0, "w": tile_size, "h": tile_size},
                "sourceSize": {"w": tile_size, "h": tile_size},
            }
            x += tile_size

    meta = {
        "app": "DDD Sprite Atlas Builder",
        "version": "1.0",
        "image": f"{atlas_key}.png",
        "format": "RGBA8888",
        "size": {"w": sheet_width, "h": sheet_height},
        "scale": "1",
    }

    json_data = {"frames": frames_meta, "meta": meta}
    return sheet, json_data


def main() -> None:
    print("=== Sprite Atlas Builder (por entidad) ===\n")
    print(f"Carpeta base de assets: {ASSETS_DIR}")
    print(f"Los atlas generados se guardarán en: {ATLAS_DIR}\n")

    # 1. Descubrir directorios candidatos con PNGs
    print("Buscando directorios de sprites con PNGs...")
    sprite_dirs = list_sprite_dirs(ASSETS_DIR)
    if not sprite_dirs:
        print("[ERROR] No se encontraron directorios con PNGs en public/assets.")
        return

    print("\nSelecciona el directorio de sprites de la entidad.")
    print("Se abrirá una UI en consola. Usa ↑/↓ y Enter.\n")
    chosen_rel_dir = select_directory_with_curses(sprite_dirs)
    if not chosen_rel_dir:
        print("No se seleccionó ningún directorio. Saliendo.")
        return

    base_dir = os.path.join(
        ASSETS_DIR, "" if chosen_rel_dir == "." else chosen_rel_dir
    )

    png_files = [f for f in os.listdir(base_dir) if f.lower().endswith(".png")]
    if not png_files:
        print("[ERROR] No se encontraron PNGs en ese directorio.")
        return

    print("\nSe abrirá una UI en consola para seleccionar las imágenes.")
    print("Usa ↑/↓ para moverte, espacio para marcar, Enter para confirmar.\n")

    selected_files = select_files_with_curses(png_files)
    if not selected_files:
        print("No se seleccionó ninguna imagen. Saliendo.")
        return

    print("\nImágenes seleccionadas:")
    for f in selected_files:
        print(f" - {f}")

    print("\nAhora asigna un nombre de animación a cada imagen seleccionada.")
    print("Ejemplos: orc_idle, orc_walk, orc_attack\n")

    anim_names: Dict[str, str] = {}
    for filename in selected_files:
        while True:
            anim = input(f"Animación para {filename}: ").strip()
            if anim:
                anim_names[filename] = anim
                break
            print("  El nombre de animación no puede estar vacío.")

    atlas_key = input(
        "\nKey del atlas para Phaser (ej: orc, hero, goblin): "
    ).strip()
    if not atlas_key:
        print("[ERROR] Debes indicar una key de atlas.")
        return

    # Primera pasada: recortar frames por animación
    anim_frames = build_frames_per_animation(base_dir, selected_files, anim_names)
    if not anim_frames:
        print("[ERROR] No se generó ningún frame a partir de las imágenes.")
        return

    # Calcular tamaño de tile unificado
    tile_size = compute_tile_size(anim_frames)
    print(f"\nTamaño de tile calculado: {tile_size}x{tile_size}")

    # Normalizar todos los frames a ese tamaño
    normalized_frames = normalize_frames(anim_frames, tile_size)

    # Construir atlas
    sheet, json_data = build_atlas(atlas_key, normalized_frames, tile_size)

    os.makedirs(ATLAS_DIR, exist_ok=True)
    png_path = os.path.join(ATLAS_DIR, f"{atlas_key}.png")
    json_path = os.path.join(ATLAS_DIR, f"{atlas_key}.json")

    sheet.save(png_path)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)

    print("\n✓ Atlas generado correctamente:")
    print(f" - Imagen: {png_path}")
    print(f" - JSON:   {json_path}")
    print(f"   (tile={tile_size}x{tile_size}, total frames={sheet.size[0] // tile_size})")


if __name__ == "__main__":
    main()
