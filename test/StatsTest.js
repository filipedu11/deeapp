import { Stats } from "../src/Stats";
import { strict as assert } from 'assert';

var stats1 = new Stats();

it('Is overallAccuracy equal to undefined?', () => {
    assert.equal(stats1.overallAccuracy, undefined);
});

it('Is producerAccuracy equal to undefined?', () => {
    assert.equal(stats1.producerAccuracy, undefined);
});

it('Is userAccuracy equal to undefined?', () => {
    assert.equal(stats1.userAccuracy, undefined);
});

it('Is falseNegative equal to undefined?', () => {
    assert.equal(stats1.falseNegative, undefined);
});

it('Is falsePositive equal to undefined?', () => {
    assert.equal(stats1.falsePositive, undefined);
});

it('Is trueNegative equal to undefined?', () => {
    assert.equal(stats1.trueNegative, undefined);
});

it('Is truePositive equal to undefined?', () => {
    assert.equal(stats1.truePositive, undefined);
});

var stats = new Stats(10,10,10,10,10,10,10);

it('overallAccuracy is equal to 10', () => {
    assert.equal(stats.overallAccuracy, 10);
});

it('producerAccuracy is equal to 10', () => {
    assert.equal(stats.producerAccuracy, 10);
});

it('userAccuracy is equal to 10', () => {
    assert.equal(stats.userAccuracy, 10);
});

it('falseNegative is equal to 10', () => {
    assert.equal(stats.falseNegative, 10);
});

it('falsePositive is equal to 10', () => {
    assert.equal(stats.falsePositive, 10);
});

it('trueNegative is equal to 10', () => {
    assert.equal(stats.trueNegative, 10);
});

it('truePositive is equal to 10', () => {
    assert.equal(stats.truePositive, 10);
});