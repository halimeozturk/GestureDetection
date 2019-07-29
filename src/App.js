import React , {Component} from 'react';
import './App.css';
import CameraPhoto, { FACING_MODES, IMAGE_TYPES } from 'jslib-html5-camera-photo';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import axios from 'axios';

class App extends Component {
  constructor (props) {
    super(props);
    this.cameraPhoto = null;
    this.videoRef = React.createRef();
    this.state = {
      sendCount: 0,
      imageData:[],
      response: [],
      bufferphoto : [],
      showphoto: []

    }

    setInterval(() => {
      this.takePhoto()
    },2000);

  }


  componentDidMount () {
    this.cameraPhoto = new CameraPhoto(this.videoRef.current);
    this.startCamera()
  }

  startCamera = () => {
    var facingMode = FACING_MODES.ENVIRONMENT;
    // var idealResolution = { width: 640, height: 480 };
    // this.cameraPhoto.startCamera(idealFacingMode, idealResolution)
    this.cameraPhoto.startCamera(facingMode, {})
      .then(() => {
        console.log('camera is started !');
      })
      .catch((error) => {
        console.error('Camera not started!', error);
      });
  }

  takePhoto = () => {
    const config = {
      sizeFactor : 1,
      imageCompression : .90,
      isImageMirror : false
    };
 
    let uri = this.cameraPhoto.getDataUri(config);

    if (uri && this.state.sendCount != 1) {
      let imageData = this.state.imageData
      imageData.push(this.dataURItoBlob(uri))
      let bufferphoto = this.state.bufferphoto
      bufferphoto.push(uri)
      this.setState({ imageData : imageData,
                      sendCount: (this.state.sendCount + 1),
                      bufferphoto : bufferphoto,
                      showphoto : bufferphoto
                    })

                      console.log(imageData)
      if (this.state.sendCount == 1) {
        this.image()
      }

    }
  }

  image = () => {

    let formdata = new FormData()
    this.state.imageData.map(e => {
      formdata.append("media", e);
    })

    axios({
      url:"http://207.154.232.181:6080/image",
      method:'POST',
      headers: {'Content-Type': 'multipart/form-data'},
      data:formdata    
      }).then((res)=>{
        this.setState({imageData: [],
                       sendCount: 0,
                       response : res.data.substr(1).slice(0, -1).split(","),
                       bufferphoto : []
        });
      }).catch((Error) => {
        this.setState({imageData: [],
                       sendCount: 0,
                      bufferphoto : []})
      })
  }

  dataURItoBlob = dataURI => {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
  }

  render(){
    return(
      <div>
        <div class = "video-container">
          <video ref={this.videoRef}
                 autoPlay="true"/>
       </div>
       <div class="status-container">
        <div>
          <Progress type="circle" percent={(this.state.response[0] * 100).toFixed(2)} strokeWidth={13}/>
          <h2> ANGRY </h2>
        </div>

        <div>
          <Progress type="circle" percent={(this.state.response[1] * 100).toFixed(2)} strokeWidth={13} />
          <h2> SUPRISE </h2>
        </div>

        <div>
          <Progress type="circle" percent={(this.state.response[2] * 100).toFixed(2)} strokeWidth={13} />
          <h2> HAPPY </h2>
        </div>

        <div>
          <Progress type="circle" percent={(this.state.response[3] * 100).toFixed(2)} strokeWidth={13} />
          <h2> NATURAL </h2>
        </div>
      </div>
    
        <img
          alt="imgCamera"
          src={this.state.bufferphoto[0]}
        />
    </div>
    )
  }
}

export default App;