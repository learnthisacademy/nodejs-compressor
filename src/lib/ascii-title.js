import figlet from 'figlet';

const createAsciiTitle = (title) => {
    return new Promise((resolve, reject) =>
        figlet.text(
            title,
            {
                font: 'Rammstein',
                width: 100,
            },
            (err, data) => {
                if (err) reject(err);
                else {
                    console.log('\n' + data);
                    resolve(null);
                }
            }
        )
    );
};

export default createAsciiTitle;
