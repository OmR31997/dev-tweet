/** Routes where the main pane fills the viewport and inner panels handle scroll. */
export function isFillRoute(pathname: string) {
  return (
    pathname.startsWith("/messages") ||
    /^\/roadmaps\/.+/.test(pathname) ||
    pathname.startsWith("/course") ||
    pathname.startsWith("/learn-git")
  );
}

/** Routes that hide the mobile bottom tab bar (full-screen immersive views). */
export function isMobileNavHidden(pathname: string) {
  return (
    /^\/messages\/.+/.test(pathname) ||
    /^\/roadmaps\/.+/.test(pathname) ||
    pathname.startsWith("/course") ||
    pathname.startsWith("/learn-git")
  );
}
