const express = require('express');

const app = express();

app.use(express.json());

app.post('/heparin', (req, res) => {

    const utterance = req.body.userRequest.utterance
        .trim()
        .toUpperCase();

    let protocol = '';
    let weight = 0;

    // 숫자 추출
    const numberMatch = utterance.match(/[0-9.]+/);

    if (numberMatch) {
        weight = Number(numberMatch[0]);
    }

    // 프로토콜 확인
    if (utterance.includes('MI')) {
        protocol = 'MI';
    }

    if (utterance.includes('DVT')) {
        protocol = 'DVT';
    }

    // 오류 처리
    if (!protocol || !weight) {

        return res.json({
            version: "2.0",
            template: {
                outputs: [
                    {
                        simpleText: {
                            text:
`입력 예시

MI 60
DVT 70`
                        }
                    }
                ]
            }
        });

    }

    let bolus = 0;
    let infusion = 0;

    // MI
    if (protocol === 'MI') {

        bolus = weight * 60;

        if (bolus > 4000) {
            bolus = 4000;
        }

        infusion = weight * 12;

        if (infusion > 1000) {
            infusion = 1000;
        }

    }

    // DVT
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

(${mlhr} ml/hr)`;

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
