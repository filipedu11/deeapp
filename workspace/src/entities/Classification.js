
import { ClassificationDecode } from '../decode/ClassificationDecode';


var cDec = new ClassificationDecode();

export class Classification{

    constructor(classificationID, classificationName, classificationDescription, 
        classificationRasterFile, classificationSource, classificationStats, classificationStyle, features, geojsonFile) {
        this.classificationID = classificationID;
        this.classificationName = classificationName;
        this.classificationDescription = classificationDescription;
        this.classificationRasterFile = classificationRasterFile;
        this.classificationSource = classificationSource;
        this.classificationStats = classificationStats;
        this.classificationStyle = classificationStyle;
        this.features = features;
        this.geojsonFile = geojsonFile;
    }

    /**
     * Return the classification name
     */
    getId(){
        return this.classificationID;
    }

    /**
     * Return the classification name
     */
    getName(){
        return this.classificationName;
    }

    /**
     * Return the classification description
     */
    getDescription(){
        return this.classificationDescription;
    }

    /**
     * Return the classification author
     */
    getAuthor(){
        return this.classificationSource[cDec.author];
    }

    /**
     * Return the classification algorithm
     */
    getClassifierAlgorithm(){
        return this.classificationSource[cDec.classificationAlgorithm];
    }

    /**
     * Return the pre processement techniques used
     */
    getPreProcessementTechniquesUsed(){
        return this.classificationSource[cDec.preProcTechniquesUsed];
    }

    /**
     * Return the pre processement techniques used
     */
    getPosProcessementTechniquesUsed(){
        return this.classificationSource[cDec.postProcTechniquesUsed];
    }

    /**
     * Return the collected date of inputs (satelite images)
     */
    getCollectedDate(){
        return this.classificationSource[cDec.collectedDate];
    }

    /**
     * Return the classification date
     */
    getClassificationDate(){
        return this.classificationSource[cDec.classificationDate];
    }

    /**
     * Return the class stats of classification
     */
    getClassStats() {
        return this.classificationStats[cDec.classStats];
    }
    
    /**
     * Return the global stats of classification
     */
    getGlobalStats() {
        return this.classificationStats[cDec.globalStats];
    }

    /**
     * Return the properties / stats of each polygon
     */
    getPropertiesOfPolygon(index) {
        return this.features[index][cDec.polygonProperties];
    }

    getColorOfClass(classId){
        var colorDict = this.classificationStyle[cDec.color];
        return colorDict[classId];
    }

    getType(){
        return 'classification';
    }

    createLegend(){
        
        var legend = document.getElementById('legend');
        var cStatsArray = this.getClassStats();

        legend.innerHTML = '<h6><b><u>Legend</u></b></h6>';
                
        for (let index = 0; index < cStatsArray.length; index++) {
            const classEl = cStatsArray[index];

            legend.innerHTML += 
                '<li><span class="circle" style="background:' + this.getColorOfClass(classEl[cDec.classID]) + ';"></span> ' + classEl[cDec.className] + ' </li>';
        }

        legend.style.display = 'inline-block';
    }

    clearLegend(){
        
        var legend = document.getElementById('legend');

        if (legend !== null) {
            //CLEAR PREVIOUS CONTENT
            legend.innerHTML = '';
            legend.style.display = 'none';
        }
    }


    createReport(){
        
        var content = document.getElementById('content-metadata');

        content.append(this.getContentReport());
    }

    getContentReport(){
        var sourceC = document.getElementById('content-metadata-'+this.getId());

        if (sourceC === null) {
            sourceC = document.createElement('div');
            sourceC.id = 'content-metadata-'+this.getId();
        }

        sourceC.innerHTML = 
            '<div class="card border-dark mb-3">'+
                '<div class="card-header text-center mask flex-center rgba-red-strong" data-toggle="collapse" href="#collapse' + this.getId() + '" ' +
                    'role="button" aria-expanded="true" aria-controls="collapse">'+
                    this.getName() +
                '</div>' +
                '<div class="card-body collapse" id="collapse' + this.getId() + '" style="padding: 0px">'+
                    '<table class="table table-bordered table-dark" style="margin: 0px;">' +
                        '<tbody>' +
                            '<tr>' +
                                '<th scope="row">Description</th>' +
                                '<td>' + this.getDescription() +'</td>' +
                            '</tr>' +
                            '<tr>' +
                                '<th scope="row">Author</th>'+
                                '<td>' + this.getAuthor() + '</td>'+
                            '</tr>'+
                            '<tr>' +
                                '<th scope="row">Classification Algorithm</th>'+
                                '<td>' + this.getClassifierAlgorithm() + '</td>'+
                            '</tr>'+
                            '<tr>' +
                                '<th scope="row">Collected Data Date</th>'+
                                '<td>' + this.getCollectedDate() + '</td>'+
                            '</tr>'+
                            '<tr>' +
                                '<th scope="row">Classification Date</th>'+
                                '<td>' + this.getClassificationDate() + '</td>'+
                            '</tr>'+
                        '</tbody>'+
                    '</table>' +
                '</div>' +
            '</div>';
        return sourceC;
    }

    clearReport(){
        var content = document.getElementById('content-metadata-'+this.getId());

        if (content !== null) {
            //CLEAR PREVIOUS CONTENT
            content.innerHTML = '';
        }
    }

    createStats(){
        
        var content = document.getElementById('content-stats');

        content.append(this.getContentStats());
    }

    getContentStats(){
        
        var sourceC = document.getElementById('content-stats-'+this.getId());

        if (sourceC === null) {
            sourceC = document.createElement('div');
            sourceC.id = 'content-stats-'+this.getId();
        }

        sourceC.innerHTML = 
            '<div class="card border-dark mb-3">'+
                '<div class="card-header text-center mask flex-center rgba-red-strong">'+
                    this.getName() +
                '</div>' +
                '<div class="card-body" style="padding: 0px">'+
                    '<table class="table table-bordered table-dark" style="margin: 0px;">' +
                        '<tbody>' +
                            '<tr>' +
                                '<th scope="row">Description</th>' +
                                '<td>' + this.getDescription() +'</td>' +
                            '</tr>' +
                            '<tr>' +
                                '<th scope="row">Author</th>'+
                                '<td>' + this.getAuthor() + '</td>'+
                            '</tr>'+
                            '<tr>' +
                                '<th scope="row">Classification Algorithm</th>'+
                                '<td>' + this.getClassifierAlgorithm() + '</td>'+
                            '</tr>'+
                            '<tr>' +
                                '<th scope="row">Collected Data Date</th>'+
                                '<td>' + this.getCollectedDate() + '</td>'+
                            '</tr>'+
                            '<tr>' +
                                '<th scope="row">Classification Date</th>'+
                                '<td>' + this.getClassificationDate() + '</td>'+
                            '</tr>'+
                        '</tbody>'+
                    '</table>' +
                '</div>' +
            '</div>';
        return sourceC;
    }

    clearStats(){
        var content = document.getElementById('content-stats-'+this.getId());

        if (content !== null) {
            //CLEAR PREVIOUS CONTENT
            content.innerHTML = '';
        }
    }
}