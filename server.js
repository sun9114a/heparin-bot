const express = require('express');

const app = express();

app.use(express.json());

app.post('/heparin', (req, res) => {
    const utterance = req.body.userRequest.utterance.trim().toUpperCase();

    let protocol = '';
    let weight = 0;

    if (utterance.startsWith('MI-')) {
        protocol = 'MI';
        weight = Number(utterance.replace('MI-', ''));
    } else if (utterance.startsWith('DVT-')) {
        protocol = 'DVT';
        weight = Number(utterance.replace('DVT-', ''));
    }

    if (!protocol || !weight || isNaN(weight)) {
        return res.json({
            version: "2.0",
            template: {
                outputs: [
                    {
                        simpleText: {
                            text: "입력 형식이 올바르지 않습니다.\n\n예시:\nMI-60\nDVT-60"
                        }
                    }
                ]
            }
        });
    }

    let bolus = 0;
    let infusion = 0;

    if (protocol === 'MI') {
        bolus = weight * 60;
        if (bolus > 4000) bolus = 4000;

        infusion = weight * 12;
        if (infusion > 1000) infusion = 1000;
    }

    if (protocol === 'DVT') {
        bolus = weight * 80;
        infusion = weight * 18;
    }

    const mlhr = (infusion / 50).toFixed(1);

    const result =
`[${protocol} protocol]

체중: ${weight} kg

Bolus:
${bolus} units IV

Initial infusion:
${infusion} units/hr

${mlhr} ml/hr`;

    res.json({
        version: "2.0",
        template: {
            outputs: [
                {
                    simpleText: {
                        text: result
                    }
                }
            ]
        }
    });
});

app.get('/', (req, res) => {
    res.send('heparin bot server running');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('server start');
});
