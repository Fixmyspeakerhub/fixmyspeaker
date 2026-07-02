/* FixMySpeaker — shared audio tool engine
   Each page defines window.TOOL_MODES = { key:{name,freqs,color,dur,label}, ... }
   and window.TOOL_DEFAULT = 'key', then calls initTool()
*/
(function(){
'use strict';

function initTool(){
  var modes = window.TOOL_MODES;
  if(!modes) return;
  var modeKeys = Object.keys(modes);
  var current = window.TOOL_DEFAULT || modeKeys[0];

  var modeWrap = document.getElementById('modeWrap');
  var playBtn = document.getElementById('playBtn');
  var freqLabel = document.getElementById('freqLabel');
  var timerLabel = document.getElementById('timerLabel');
  var volSlider = document.getElementById('volSlider');
  var canvas = document.getElementById('waveCanvas');
  var ctx2d = canvas ? canvas.getContext('2d') : null;

  var audioCtx=null, osc=null, gainNode=null, analyser=null, rafId=null;
  var playing=false, timeLeft=0, timerInterval=null, freqIndex=0, freqSwitchInterval=null;
  var volume = 0.5;

  function resizeCanvas(){
    if(!canvas) return;
    var r = canvas.getBoundingClientRect();
    canvas.width = r.width * (window.devicePixelRatio||1);
    canvas.height = r.height * (window.devicePixelRatio||1);
  }
  window.addEventListener('resize', resizeCanvas);

  if(modeWrap){
    modeKeys.forEach(function(key){
      var b = document.createElement('button');
      b.className = 'mode-btn' + (key===current?' active':'');
      b.textContent = modes[key].name;
      b.setAttribute('data-mode', key);
      b.onclick = function(){
        current = key;
        Array.prototype.forEach.call(modeWrap.children, function(c){c.classList.remove('active')});
        b.classList.add('active');
        updateMeta();
        if(playing){ stop(); start(); }
      };
      modeWrap.appendChild(b);
    });
  }

  function updateMeta(){
    var m = modes[current];
    if(freqLabel) freqLabel.textContent = m.label;
    if(timerLabel) timerLabel.textContent = m.dur + 's cycle · tap play to begin';
  }
  updateMeta();

  function draw(){
    if(!ctx2d || !analyser) return;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    ctx2d.clearRect(0,0,canvas.width,canvas.height);
    ctx2d.lineWidth = 2*(window.devicePixelRatio||1);
    ctx2d.strokeStyle = modes[current].color || '#00d4ff';
    ctx2d.beginPath();
    var sliceWidth = canvas.width / bufferLength;
    var x = 0;
    for(var i=0;i<bufferLength;i++){
      var v = dataArray[i]/128.0;
      var y = v * canvas.height/2;
      if(i===0) ctx2d.moveTo(x,y); else ctx2d.lineTo(x,y);
      x += sliceWidth;
    }
    ctx2d.stroke();
    rafId = requestAnimationFrame(draw);
  }

  function setFrequencyCycle(){
    var m = modes[current];
    if(!m.freqs || m.freqs.length<2) return;
    freqIndex = 0;
    freqSwitchInterval = setInterval(function(){
      freqIndex = (freqIndex+1) % m.freqs.length;
      if(osc) osc.frequency.setValueAtTime(m.freqs[freqIndex], audioCtx.currentTime);
    }, 900);
  }

  function start(){
    var m = modes[current];
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended') audioCtx.resume();
    osc = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(m.freqs[0], audioCtx.currentTime);
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    osc.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    osc.start();
    playing = true;
    resizeCanvas();
    draw();
    setFrequencyCycle();
    if(playBtn) playBtn.innerHTML = '&#10073;&#10073;';
    timeLeft = m.dur;
    if(timerLabel) timerLabel.textContent = timeLeft+'s remaining';
    timerInterval = setInterval(function(){
      timeLeft--;
      if(timerLabel) timerLabel.textContent = Math.max(timeLeft,0)+'s remaining';
      if(timeLeft<=0){ stop(); if(timerLabel) timerLabel.textContent = 'Done — tap play to repeat'; }
    },1000);
  }

  function stop(){
    playing = false;
    if(osc){ try{osc.stop();}catch(e){} osc.disconnect(); osc=null; }
    if(gainNode){ gainNode.disconnect(); gainNode=null; }
    if(analyser){ analyser.disconnect(); analyser=null; }
    if(rafId) cancelAnimationFrame(rafId);
    if(timerInterval) clearInterval(timerInterval);
    if(freqSwitchInterval) clearInterval(freqSwitchInterval);
    if(ctx2d) ctx2d.clearRect(0,0,canvas.width,canvas.height);
    if(playBtn) playBtn.innerHTML = '&#9658;';
  }

  if(playBtn){
    playBtn.onclick = function(){
      if(playing) stop(); else start();
    };
  }
  if(volSlider){
    volSlider.oninput = function(){
      volume = volSlider.value/100;
      if(gainNode) gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    };
  }

  document.addEventListener('visibilitychange', function(){
    if(document.hidden && playing) stop();
  });
}

document.addEventListener('DOMContentLoaded', initTool);

/* FAQ accordion — used on every page */
document.addEventListener('DOMContentLoaded', function(){
  var items = document.querySelectorAll('.faq-item');
  items.forEach(function(item){
    var q = item.querySelector('.faq-q');
    if(!q) return;
    q.addEventListener('click', function(){
      item.classList.toggle('open');
    });
  });
  var menuBtn = document.querySelector('.menu-btn');
  var navLinks = document.querySelector('.nav-links');
  if(menuBtn && navLinks){
    menuBtn.addEventListener('click', function(){
      navLinks.style.display = navLinks.style.display==='flex' ? 'none' : 'flex';
      navLinks.style.cssText += navLinks.style.display==='flex' ? 'position:absolute;top:72px;left:0;right:0;background:#0d1220;flex-direction:column;padding:20px 24px;gap:18px;border-bottom:1px solid #1e2942;' : '';
    });
  }
});
})();
