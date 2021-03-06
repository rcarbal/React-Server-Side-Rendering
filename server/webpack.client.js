const path = require('path');
const merge = require('webpack-merge');
const base = require('./webpack.base.js')

const config =  {
     // Tell webpack the root file of our server application.
     entry: './src/client/client.js', 
    // Tells webpack where to put the output file that is generated
    output:{
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
    }
}

module.exports = merge(base, config);