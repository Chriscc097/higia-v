const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { schedule } = require("firebase-functions/v2/scheduler");
const { getDownloadURL } = require("firebase-admin/storage");
const { logger } = require("firebase-functions");

initializeApp();

const db = getFirestore();
const storage = getStorage();

exports.scheduledDeleteOldPdfs = schedule("every 24 hours", async () => {
  const [files] = await storage.bucket().getFiles({
    prefix: "", // raíz del bucket
  });

  const now = new Date();

  for (const file of files) {
    if (!file.name.endsWith("/labels.pdf")) continue;

    const [metadata] = await file.getMetadata();
    const createdDate = new Date(metadata.timeCreated);
    const ageInMs = now - createdDate;

    // 3 meses = ~90 días
    const threeMonthsInMs = 90 * 24 * 60 * 60 * 1000;

    if (ageInMs >= threeMonthsInMs) {
      try {
        const pathParts = file.name.split("/");
        const loadId = pathParts[0]; // "bucket/loadid/labels.pdf"

        // Actualiza el documento en Firestore
        await db.collection("loads").doc(loadId).update({
          labels: null
        });

        // Elimina el archivo
        await file.delete();
        logger.info(`Archivo eliminado y Firestore actualizado para: ${loadId}`);
      } catch (error) {
        logger.error(`Error procesando ${file.name}`, error);
      }
    }
  }
});
