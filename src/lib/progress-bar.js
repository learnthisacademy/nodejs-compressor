import cliProgress from 'cli-progress';
import { stat } from 'fs/promises';
import toFixedMB from './to-fixed-mb.js';

const createProgressBar = async (pathFile) => {
    const statFile = await stat(pathFile);

    const progressBar = new cliProgress.Bar(
        {
            format: 'Progreso [{bar}] {percentage}% | ETA: {eta}s | Duration: {duration}s | {value}/{total}MB',
            formatValue: (value, _, type) => {
                if (type !== 'total' && type !== 'value') return value;
                return toFixedMB(value);
            },
        },
        cliProgress.Presets.shades_grey
    );

    progressBar.start(statFile.size, 0);

    return progressBar;
};

export default createProgressBar;
