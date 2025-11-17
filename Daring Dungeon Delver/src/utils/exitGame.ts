/**
 * exitGame - Handles game exit functionality
 * Notifies the parent portal and attempts to close the window/tab
 */

/**
 * Exit the game and notify the parent portal
 * This function sends a message to the parent window (GameLab portal)
 * and attempts to close the current window/tab
 */
export function exitGame(): void {
  try {
    // Notify parent portal that the game is closing
    const allowedOrigin = import.meta.env.VITE_ALLOWED_ORIGIN || window.location.origin;
    
    window.parent.postMessage(
      {
        type: 'GAME_EXIT',
        timestamp: new Date().toISOString(),
      },
      allowedOrigin
    );

    // Small delay to ensure message is sent before closing
    setTimeout(() => {
      // Try to close the window (works if opened by script)
      window.close();

      // If window.close() doesn't work (e.g., not opened by script),
      // navigate back to the portal
      if (!window.closed) {
        // Try to go back in browser history
        if (window.history.length > 1) {
          window.history.back();
        } else {
          // If no history, try to navigate to portal root
          const portalUrl = allowedOrigin || '/';
          window.location.href = portalUrl;
        }
      }
    }, 100);
  } catch (error) {
    console.error('Error exiting game:', error);
    
    // Fallback: try to navigate back
    try {
      window.history.back();
    } catch {
      // If all else fails, reload to root
      window.location.href = '/';
    }
  }
}

/**
 * Show confirmation dialog before exiting
 * @param message - Custom confirmation message (optional)
 * @returns true if user confirms exit, false otherwise
 */
export function confirmExit(message?: string): boolean {
  const defaultMessage = '¿Estás seguro de que quieres salir del juego?';
  return confirm(message || defaultMessage);
}

/**
 * Exit with confirmation
 * Shows a confirmation dialog and exits if user confirms
 * @param message - Custom confirmation message (optional)
 */
export function exitGameWithConfirmation(message?: string): void {
  if (confirmExit(message)) {
    exitGame();
  }
}
