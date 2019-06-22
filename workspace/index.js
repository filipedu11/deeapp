/**
 * Import CSS
 */
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import 'ol/ol.css';
import './static/css/ol-layerswitcher.css';
import './static/css/map.css';
//import 'sidebar-v2/css/ol3-sidebar.css';
import './static/css/sidebar.css';
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
app.addClassification(readFiles.readClassificationExample());
//app.addClassification(readFiles.readCountries());