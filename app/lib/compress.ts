/**
 * Client-side image compression utility.
 * Resizes an image file if it exceeds maxDimensions and outputs a compressed JPEG/WebP blob.
 */
export async function compressImage(
    file: File,
    quality: number = 0.85,
    maxDimension: number = 2560
): Promise<File> {
    return new Promise((resolve, reject) => {
        // Only compress images
        if (!file.type.startsWith("image/")) {
            return resolve(file);
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Check if resizing is necessary
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    return reject(new Error("Could not get 2D context from canvas"));
                }

                // Draw image onto canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed Blob/File
                const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            return reject(new Error("Canvas conversion to blob failed"));
                        }

                        // Construct a new file
                        const extension = outputType === "image/png" ? "png" : "jpg";
                        const baseName =
                            file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
                        const compressedFile = new File(
                            [blob],
                            `${baseName}_optimized.${extension}`,
                            {
                                type: outputType,
                                lastModified: Date.now(),
                            }
                        );
                        resolve(compressedFile);
                    },
                    outputType,
                    quality
                );
            };
            img.onerror = () => reject(new Error("Failed to load image element"));
            img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}
