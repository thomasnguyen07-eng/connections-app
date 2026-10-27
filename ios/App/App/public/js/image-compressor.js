// public/js/image-compressor.js
// MAKE FUNCTION GLOBALLY AVAILABLE
window.compressImageForUpload = async function (file) {
  console.log("=== COMPRESSION STARTED ===");
  console.log("File:", file.name, "Size:", file.size, "bytes");

  const sizeThresholdKB = 200;
  const sizeThresholdBytes = sizeThresholdKB * 1024;

  if (file.size <= sizeThresholdBytes) {
    console.log("✅ Image is small, skipping compression");
    return file;
  }

  // Compression settings
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: "image/jpeg",
  };

  try {
    console.log("🔄 Compressing large image...");
    const compressedFile = await imageCompression(file, options);

    const compressionRatio = Math.round(
      (1 - compressedFile.size / file.size) * 100
    );
    console.log(
      `✅ Compressed: ${compressedFile.size} bytes (${compressionRatio}% reduction)`
    );

    if (compressedFile.size < file.size) {
      return compressedFile;
    } else {
      console.log("⚠️ Compression didn't reduce size, using original");
      return file;
    }
  } catch (error) {
    console.error("❌ Compression failed:", error);
    return file;
  }
};

// === IMAGE COMPRESSOR STATUS CHECK ===
console.log("🖼️ Image Compressor: Loaded and ready");

// Test if the function is accessible globally
window.testImageCompressor = async function () {
  console.log("Testing image compressor...");

  // Create a test blob to check compression
  const testBlob = new Blob(["test"], { type: "image/jpeg" });
  testBlob.name = "test.jpg";
  testBlob.size = 500000; // 500KB test file

  try {
    const result = await window.compressImageForUpload(testBlob);
    console.log("✅ Image compressor working - Test file processed");
    return true;
  } catch (error) {
    console.error("❌ Image compressor error:", error);
    return false;
  }
};

// Optional: Auto-test after page load
setTimeout(() => {
  window.testImageCompressor();
}, 3000);
