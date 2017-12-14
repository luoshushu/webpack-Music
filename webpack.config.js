// const path = require('path');

// // const UglifyJsPlugin = require('uglifyjs-webpack-plugin');



// module.exports = {
//   entry:'./src/index.js' ,
//   output: {
//     filename: 'bundle.js',
//     path: path.resolve(__dirname, 'dist')
//   },
//     module: {
//       rules: [
//         {
//           test: /\.css$/,
//           use: [
//             'style-loader',
//             'css-loader'
//           ]
//         }
//       ],

        

//     }

 
//     //在webpack的不同编译阶段，会去做不同的事情，
//     // plugins:[
//     //   new uglifyJsPlugin({ //压缩和混淆代码
//     //     compress:{
//     //       warnings:false
//     //     }
//     //   })

//     // ]


   



// };





const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry:'./src/index.js' ,
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: './dist',//本地服务器所加载的页面所在的目录
    inline: true,  ////实时刷新
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader","postcss-loader"]
      }
    ]
  }, 

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new ExtractTextPlugin("style.css")
],



};



