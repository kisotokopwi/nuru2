export function blobToUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function downloadUrl(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

