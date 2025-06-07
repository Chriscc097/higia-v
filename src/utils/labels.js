import bwipjs from "bwip-js";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts?.pdfMake?.vfs;

// 📌 Función para generar y subir el PDF
async function generateBarcodePDF(labels, loadId) {
    try {
        const storage = getStorage();

        // Genera todos los códigos de barras en paralelo
        const barcodeImages = await Promise.all(
            labels.map(label =>
                label.code
                    ? generateBarcode(label.code)
                    : Promise.resolve(null)
            )
        );

        // 🔄 Recorre los labels y genera las celdas
        const tableBody = [];
        let row = [];

        for (let i = 0; i < labels.length; i++) {
            const label = labels[i];
            if (!label.code || !barcodeImages[i]) {
                console.error("Código de barra no especificado para la etiqueta:", label);
                continue;
            }

            const cellContent = [
                { text: label.client, margin: [0, 0, 0, 0], fontSize: 8, alignment: "center" },
                { text: label.package, margin: [0, 0, 0, 0], fontSize: 8, alignment: "center" },
                {
                    image: barcodeImages[i],
                    alignment: "center",
                    margin: [0, 5, 0, 5],
                    fit: [130, 70]
                },
                { text: label.footer, fontSize: 8, margin: [0, 0, 0, 0], alignment: "center" }
            ];

            row.push({ stack: cellContent, margin: [5, 5, 5, 5] });

            if (row.length === 4) {
                tableBody.push(row);
                row = [];
            }
        }

        if (row.length > 0) {
            tableBody.push(row);
        }

        const content = [{
            table: {
                widths: ["25%", "25%", "25%", "25%"],
                body: tableBody
            }
        }];

        const docDefinition = {
            content,
            pageMargins: [9, 9, 9, 9],
            pageSize: 'LETTER'
        };

        // 📄 Genera el PDF como Blob
        return new Promise((resolve, reject) => {
            pdfMake.createPdf(docDefinition).getBlob(async (blob) => {
                try {
                    const fileRef = ref(storage, `${loadId}/labels.pdf`);
                    await uploadBytes(fileRef, blob);
                    const downloadUrl = await getDownloadURL(fileRef);
                    resolve(downloadUrl);
                } catch (error) {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error("Error generando PDF:", error);
        throw error;
    }
}

// 📌 Función para generar un código de barras en base64
function generateBarcode(code) {
    return new Promise((resolve, reject) => {
        try {
            if (!code) {
                throw new Error("Código de barra no especificado");
            }
            const canvas = document.createElement("canvas");
            bwipjs.toCanvas(canvas, {
                bcid: "code128",
                text: code,
                scale: 3,
                height: 10,
                includetext: true,
                textxalign: "center",
                textsize: 12
            });
            resolve(canvas.toDataURL("image/png"));
        } catch (error) {
            reject(error);
        }
    });
}

export { generateBarcodePDF };
