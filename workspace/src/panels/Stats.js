
export class Stats {

    constructor(overallAccuracy, producerAccuracy, userAccuracy, truePositive, trueNegative, falsePositive, falseNegative){
        this.overallAccuracy = overallAccuracy;
        this.producerAccuracy = producerAccuracy;
        this.userAccuracy = userAccuracy;
        this.truePositive = truePositive;
        this.trueNegative = trueNegative;
        this.falsePositive = falsePositive;
        this.falseNegative = falseNegative;
    }
}