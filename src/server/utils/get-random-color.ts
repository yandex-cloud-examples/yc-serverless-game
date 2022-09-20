import { padStart } from 'lodash';

export const getRandomColor = (existingColors: string[]): string => {
    const MIN_COLOR = 0;
    const MAX_COLOR = 0xFF_FF_FF;
    const existingColorsNumbers = existingColors
        .map((c) => Number.parseInt(c, 16))
        .sort((a, b) => a - b);

    const colorsSet = [
        MIN_COLOR,
        ...existingColorsNumbers,
        MAX_COLOR,
    ];

    let startingColor = 0;
    let distance = 0;

    for (let i = 0; i < colorsSet.length - 1; i++) {
        const newColor = colorsSet[i];
        const newDistance = colorsSet[i + 1] - newColor;

        if (newDistance > distance) {
            distance = newDistance;
            startingColor = newColor;
        }
    }

    const randomBounds = distance / 3;
    const randomNum = (Math.random() - 0.5) * randomBounds;
    const colorNum = Math.abs(Math.round(startingColor + distance / 2 + randomNum));

    return padStart(Math.min(colorNum, MAX_COLOR).toString(16), 6, '0');
};
