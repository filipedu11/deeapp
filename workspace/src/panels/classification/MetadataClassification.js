import { Metada } from '../Metadata';

export class MetadaClassification extends Metada{

    constructor(lyrObj){
        super(lyrObj);
    }

    createMetadataPanel(){

        var obj = this.lyrObj;

        var content = document.getElementById('content-metadata');

        var sourceC = document.getElementById('content-metadata-'+obj.getId());

        if (sourceC === null) {
            sourceC = document.createElement('div');
            sourceC.id = 'content-metadata-'+obj.getId();
        }

        sourceC.innerHTML = 
            '<div class="card border-dark mb-3">'+
                '<div class="card-header text-center mask flex-center rgba-red-strong" data-toggle="collapse" href="#collapse' + obj.getId() + '" ' +
                    'role="button" aria-expanded="true" aria-controls="collapse">'+
                    obj.getName() +
                '</div>' +
                '<div class="card-body collapse" id="collapse' + obj.getId() + '" style="padding: 0px">'+
                    '<table class="table table-bordered table-dark" style="margin: 0px;">' +
                        '<tbody>' +
                            '<tr>' +
                                '<th scope="row">Description</th>' +
                                '<td>' + obj.getDescription() +'</td>' +
                            '</tr>' +
                            '<tr>' +
                                '<th scope="row">Author</th>'+
                                '<td>' + obj.getAuthor() + '</td>'+
                            '</tr>'+
                            '<tr>' +
                                '<th scope="row">Classification Algorithm</th>'+
                                '<td>' + obj.getClassifierAlgorithm() + '</td>'+
                            '</tr>'+
                            '<tr>' +
                                '<th scope="row">Collected Data Date</th>'+
                                '<td>' + obj.getCollectedDate() + '</td>'+
                            '</tr>'+
                            '<tr>' +
                                '<th scope="row">Classification Date</th>'+
                                '<td>' + obj.getClassificationDate() + '</td>'+
                            '</tr>'+
                        '</tbody>'+
                    '</table>' +
                '</div>' +
            '</div>';
        
        content.append(sourceC);

        return content;
    }
}