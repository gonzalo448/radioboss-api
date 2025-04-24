const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
const port = 3000;

const RADIOBOSS_INFO_URL = 'https://ritmoboss.moxapps.shop/?pass=moxradioserver&action=playbackinfo';
const RADIOBOSS_IMG_URL = 'https://ritmoboss.moxapps.shop/?pass=moxradioserver&action=trackartwork';
const STREAM_URL = 'https://mox.moxapps.shop/stream';

// Ruta para obtener los metadatos procesados
app.get('/metadata', async (req, res) => {
    try {
        console.log("Solicitando metadatos de RadioBOSS...");
        const response = await axios.get(RADIOBOSS_INFO_URL);

        console.log("XML recibido:\n", response.data); // Verifica el XML recibido

        const parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(response.data, (err, result) => {
            if (err) {
                console.error("Error al procesar XML:", err);
                return res.status(500).json({ error: 'Error al procesar los metadatos' });
            }

            console.log("Datos JSON convertidos:\n", JSON.stringify(result, null, 2));

            if (!result.Info || !result.Info.CurrentTrack || !result.Info.CurrentTrack.TRACK) {
                return res.status(500).json({ error: 'Estructura de XML inválida', received: result });
            }

            const track = result.Info.CurrentTrack.TRACK;

            const metadata = {
                artist: track.$.ARTIST || "Desconocido",
                title: track.$.TITLE || "Desconocido",
                album: track.$.ALBUM || "No disponible",
                year: track.$.YEAR || "No disponible",
                genre: track.$.GENRE || "No disponible",
                file: track.$.FILENAME || "No disponible",
                cover: RADIOBOSS_IMG_URL,
                stream: STREAM_URL
            };

            res.json(metadata);
        });
    } catch (error) {
        console.error("Error en la API:", error);
        res.status(500).json({ error: 'Error al obtener los metadatos', details: error.message });
    }
});

// Nueva ruta para ver el XML sin procesar
app.get('/rawxml', async (req, res) => {
    try {
        const response = await axios.get(RADIOBOSS_INFO_URL);
        res.send(response.data); // Enviar el XML sin procesar
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el XML', details: error.message });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`API corriendo en http://localhost:${port}`);
});