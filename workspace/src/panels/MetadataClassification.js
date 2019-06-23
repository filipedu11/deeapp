import { Metada } from './Metadata';

export class MetadaClassification extends Metada{

    constructor(){
        super();
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
}