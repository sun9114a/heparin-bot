const express = require('express');

const app = express();

app.use(express.json());

app.post('/heparin', (req, res) => {

    const utterance = req.body.userRequest.utterance
        .trim()
        .toUpperCase();

    let protocol = '';
    let weight = 0;

    // MI60 형태 처리
    if (utterance.startsWith('MI')) {

        protocol = 'MI';

        weight = Number(
            utterance.replace('MI', '')
        );

    }

    // DVT70 형태 처리
    else if (utterance.startsWith('DVT')) {

        protocol = 'DVT';

        weight = Number(
            utterance.replace('DVT', '')
        );

    }

    // 숫자 이상 입력 방지
    if (!weight || isNaN(weight)) {

        return res.json({
            version: "2.0",
            template: {
                outputs: [
                    {
                        simpleText: {
                            text:
`체중 입력 형식이 올바르지 않습니다.

예시:
MI60
DVT70`
                        }
                    }
                ]
            }
        });

    }

    let bolus = 0;
    let infusion = 0;

    // MI protocol
    if (protocol === 'MI') {

        bolus = weight * 60;

        // 최대 bolus 4000
        if (bolus > 4000) {
            bolus = 4000;
        }

        infusion = weight * 12;

        // 최대 infusion 1000
        if (infusion > 1000) {
            infusion = 1000;
        }

    }

    // DVT protocol
    else if (protocol === 'DVT') {

        bolus = weight * 80;

        infusion = weight * 18;

    }

    // 50 units/ml
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

// 서버 확인용
app.get('/', (req, res) => {
    res.send('heparin bot server running');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('server start');
});
