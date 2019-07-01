import React, { Component } from 'react';
import './qanda.css'

class QAndA extends Component {

    constructor(props){
		super(props);
    	this.state = {
            image_source:"image/step1.png"
		};

        this.switchImage = this.switchImage.bind(this);
    }
    
    switchImage(event){  
        this.setState({
            image_source:"image/"+event.target.id+".png",
        });
    }

    render() {
      var style_height0 ={'height': '0px'};
      var style_image ={'height': '80%',
                        'width':'80%'};
    return(
<div className="container">
	
	<div className="block">

      <div className="row">
        <div className="col-md-6">
          <div className="content-heading">
            <h3>操作說明</h3></div>
            <p id="step1" onClick={this.switchImage}>1.剪貼或輸入一段英文</p>
            <p id="step2" onClick={this.switchImage}>2.點選新增加的單字</p>
            <p id="step3" onClick={this.switchImage}>3.點擊“新增單字”</p>
        </div>
        <div className="col-md-6">
            <img className="img-right" style={style_image} src={this.state.image_source}/>
        </div>
     </div>
    </div>
    
</div>    
);
  }
}

export default QAndA;