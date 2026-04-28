const CATEGORY_ICON_SIZE = 256;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片读取失败"));
    };
    image.src = url;
  });
}

export async function processCategoryIconFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("请选择图片文件");
  }

  const image = await loadImageFromFile(file);
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = Math.max(0, (image.naturalWidth - sourceSize) / 2);
  const sourceY = Math.max(0, (image.naturalHeight - sourceSize) / 2);
  const canvas = document.createElement("canvas");
  canvas.width = CATEGORY_ICON_SIZE;
  canvas.height = CATEGORY_ICON_SIZE;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("图片处理失败");
  }

  context.clearRect(0, 0, CATEGORY_ICON_SIZE, CATEGORY_ICON_SIZE);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    CATEGORY_ICON_SIZE,
    CATEGORY_ICON_SIZE,
  );

  return canvas.toDataURL("image/png");
}
