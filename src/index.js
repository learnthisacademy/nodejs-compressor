import {
    assertDirectoryWritable,
    assertFileReadable,
} from '#Lib/assert-file.js';
import createProgressBar from '#Lib/progress-bar.js';
import { ProgressStream } from '#Lib/progress-stream.js';
import { createReadStream, createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { dirname, join } from 'path';
import { pipeline } from 'stream';
import { fileURLToPath } from 'url';
import { createGzip, constants } from 'zlib';
import { emitKeypressEvents } from 'readline';

/** Crear rutas de entrada y salida */
const inputFile = 'video.mp4';
const inputPathFile = join(
    dirname(fileURLToPath(import.meta.url)),
    '../data',
    inputFile
);

const outputFile = `${inputFile}.gz`;
const outputPath = join(dirname(fileURLToPath(import.meta.url)), '../out');
const outputPathFile = join(outputPath, outputFile);

const bootstrap = async () => {
    await assertFileReadable(inputPathFile);
    await assertDirectoryWritable(outputPath);

    const progressBar = await createProgressBar(inputPathFile);

    /** Streams de lectura, compresión y escritura */
    const readFileStream = createReadStream(inputPathFile);
    const progressStream = new ProgressStream(progressBar);
    const gzipStream = createGzip({
        level: constants.Z_BEST_COMPRESSION,
    });
    const writeFileStream = createWriteStream(outputPathFile);

    /** Acciones con el teclado */
    const keyPressHandler = async (key) => {
        if (key === '\u0003') {
            try {
                await unlink(outputPathFile);
            } catch (err) {}

            console.log('\nCompression aborted, finishing process...');
            process.exit();
        } else if (!gzipStream.isPaused() && key === 'p') {
            gzipStream.pause();

            console.clear();
            console.log('Compression paused, press "r" to resume');
        } else if (gzipStream.isPaused() && key === 'r') {
            gzipStream.resume();

            console.clear();
            console.log('Compression in progress, press "p" to pause');
        }
    };

    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', keyPressHandler);

    /** Conectar los streams */
    pipeline(
        readFileStream,
        progressStream,
        gzipStream,
        writeFileStream,
        async (err) => {
            if (err) {
                try {
                    await unlink(outputPathFile);
                } catch (err) {}

                console.log('Compression aborted, an error has ocurred', err);
                process.exit(1);
            } else {
                console.log('Compression finished');

                process.stdin.setRawMode(false);
                process.stdin.off('keypress', keyPressHandler);

                process.exit();
            }
        }
    );
};

bootstrap();
