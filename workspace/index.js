/**
 * Import CSS
 */
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import 'ol/ol.css';
import 'bootstrap/dist/js/bootstrap.js';
import 'bootstrap/dist/css/bootstrap.css';
import './static/css/ol-layerswitcher.css';
import './static/css/sidebar.css';
import './static/css/map.css';
import './static/css/circle.css';


/**
 * Import Main class
 */
import { Main } from './src/Main.js';

/**
 * Import ReadFile class
 */
import { ReadFiles } from './static/js/ReadFiles.js';

var app = new Main();

var readFiles = new ReadFiles();

app.addValidation(readFiles.readValidationBurnedArea());
app.addClassification(readFiles.readClassificationContinuousNaiveBayes());
app.addEvaluation(readFiles.readEvaluationContinuousNaiveBayes());
app.addEvaluation(readFiles.readEvaluationRandomForest());
app.addClassifiedImage(readFiles.readClassifiedImage());
// app.addEvaluation(readFiles.readEvaluationGmoMaxEnt());
// app.addClassification(readFiles.readClassificationWinnow());
// app.addClassification(readFiles.readClassificationCart());
//app.addClassification(readFiles.readTestClassification());
