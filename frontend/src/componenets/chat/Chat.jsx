import { useEffect, useRef, useState } from 'react';
import React from 'react'
import './chat.css';
import EmojiPicker from 'emoji-picker-react'

const Chat = () => {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const endRef =useRef(null);

  //to scroll down the chat (to see the recent msg)
  useEffect(()=>{
    endRef.current?.scrollIntoView({behaviour:"smooth"})
  },[])

  const handleEmoji =(e)=>{
    setText((prev)=>prev+e.emoji)
    setOpen(false)
  }
  
  return (
    <div className='chat'>
      <div className='top'>
        <div className='user'>
          <img src='./avatar.png' alt='avatar'/>
          <div className='texts'>
            <span>Joe Doe</span>
            <p>Lorem ipsum, dolor sit amet </p>
          </div>
        </div>
        <div className='icons'>
          <img src='./phone.png' alt='phone'/>
          <img src='./video.png' alt=''/>
          <img src='./info.png' alt=''/>
        </div>
      </div>
      <div className='center'>
      <div className='message own'>
          <img src='./avatar.png' alt=''/>
          <div className='texts'>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit, aliquam! Asperiores explicabo suscipit ut earum officia recusandae a, corporis quibusdam. Nemo ad, facere ipsum possimus dicta optio quibusdam voluptatibus dolorem!</p>
            <span>1 min ago</span>
          </div>
        </div>
        <div className='message'>
          <img src='./avatar.png' alt=''/>
          <div className='texts'>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit, aliquam! Asperiores explicabo suscipit ut earum officia recusandae a, corporis quibusdam. Nemo ad, facere ipsum possimus dicta optio quibusdam voluptatibus dolorem!</p>
            <span>1 min ago</span>
          </div>
        </div>
        <div className='message'>
          <img src='./avatar.png' alt=''/>
          <div className='texts'>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit, aliquam! Asperiores explicabo suscipit ut earum officia recusandae a, corporis quibusdam. Nemo ad, facere ipsum possimus dicta optio quibusdam voluptatibus dolorem!</p>
            <span>1 min ago</span>
          </div>
        </div>
        <div className='message own'>
          <img src='./avatar.png' alt=''/>
          <div className='texts'>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit, aliquam! Asperiores explicabo suscipit ut earum officia recusandae a, corporis quibusdam. Nemo ad, facere ipsum possimus dicta optio quibusdam voluptatibus dolorem!</p>
            <span>1 min ago</span>
          </div>
        </div>
        <div ref={endRef}></div>
      </div>
      <div className='bottom'>
      <div className='icons'>
        <img src='./img.png' alt=''/>
        <img src='./camera.png' alt=''/>
        <img src='./mic.png' alt=''/>
      </div>
      <input type='text' value={text} placeholder='Type a mesage..' onChange ={e=>setText(e.target.value)}/>
      <div className='emoji'>
        <img src='./emoji.png' alt='' onClick={()=> setOpen(prev=>!prev)}/>
        <div className='picker'>
          <EmojiPicker open={open} onEmojiClick={handleEmoji}/>
        </div>
      </div>
      <button className='sendButton'>Send</button>
      </div>
      

    </div>
  )
}

export default Chat