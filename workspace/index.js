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
import 'popper.js';


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

app.addClassification(readFiles.readClassificationExample());
// app.addClassification(readFiles.readClassificationChile());
app.addClassification(readFiles.readClassificationExample2());
// app.addClassification(readFiles.readCountries());