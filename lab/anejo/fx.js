/* Shared immersive building blocks (any pitch may use them its own way):
   FX.photoGL(canvas, urls)  - WebGL liquid photo transition (A->B), with develop/dim controls.
   FX.barrel(canvas, opts)   - procedural 3D California-oak barrel (three.js): rotation, age tint, candle flicker, drifting dust. */
(function(){
const FX={};
/* ---------- photo transition shader (raw WebGL) ---------- */
FX.photoGL=function(canvas,urls,opt){opt=opt||{};
 const gl=canvas.getContext('webgl',{premultipliedAlpha:false,antialias:false});if(!gl)return null;
 const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
 const fs=`precision highp float;uniform sampler2D A,B;uniform vec2 res,sa,sb;uniform float t,time,dim,dev,shift;
 vec2 cov(vec2 uv,vec2 r,vec2 i){float s=max(r.x/i.x,r.y/i.y);vec2 z=i*s;return (uv*r-(r-z)*.5)/z;}
 float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
 float fbm(vec2 p){return .5*n(p)+.25*n(p*2.1)+.125*n(p*4.3);}
 void main(){vec2 uv=gl_FragCoord.xy/res;uv.y=1.-uv.y;float d=fbm(uv*3.+time*.05);
  float m=smoothstep(t-.25,t+.25,d*1.4-.2+(1.-t)*.0);float mm=smoothstep(0.,1.,t);float k=mix(mm,m,.65);
  vec2 ua=cov(uv,res,sa),ub=cov(uv,res,sb);vec2 w=(vec2(d,fbm(uv*3.+7.))-.5)*.22;
  float e=t*(1.-t)*4.;vec2 sh=vec2(.007,0.)*e*shift;
  vec3 ca=vec3(texture2D(A,ua+w*t+sh).r,texture2D(A,ua+w*t).g,texture2D(A,ua+w*t-sh).b);
  vec3 cb=vec3(texture2D(B,ub-w*(1.-t)+sh).r,texture2D(B,ub-w*(1.-t)).g,texture2D(B,ub-w*(1.-t)-sh).b);
  vec3 c=mix(ca,cb,k);
  float g=dot(c,vec3(.299,.587,.114));c=mix(vec3(g),c,1.-dev*.0);
  c*=dim;float v=smoothstep(1.1,.2,length(uv-.5));c*=mix(.55,1.,v);c+=(h(uv*res+time)-.5)*.035;
  gl_FragColor=vec4(c,1.);}`;
 const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
 const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const lp=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
 const U=n=>gl.getUniformLocation(pr,n);const u={A:U('A'),B:U('B'),res:U('res'),sa:U('sa'),sb:U('sb'),t:U('t'),time:U('time'),dim:U('dim'),dev:U('dev'),shift:U('shift')};
 const tex=[],size=[];let st={a:0,b:0,t:0,dim:1,dev:0,shift:1},dirty=true,ready=0;
 urls.forEach((url,i)=>{const T=gl.createTexture();tex[i]=T;size[i]=[1,1];gl.bindTexture(gl.TEXTURE_2D,T);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([10,10,11,255]));
  const im=new Image();im.crossOrigin='anonymous';im.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,T);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   size[i]=[im.naturalWidth,im.naturalHeight];ready++;dirty=true};im.src=url});
 function rs(){const d=Math.min(devicePixelRatio||1,1.75),w=canvas.clientWidth,h=canvas.clientHeight;canvas.width=Math.max(2,w*d|0);canvas.height=Math.max(2,h*d|0);gl.viewport(0,0,canvas.width,canvas.height);dirty=true}
 function draw(now){requestAnimationFrame(draw);if(!dirty&&!opt.live)return;dirty=false;
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex[st.a]);gl.uniform1i(u.A,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,tex[st.b]);gl.uniform1i(u.B,1);
  gl.uniform2f(u.res,canvas.width,canvas.height);gl.uniform2f(u.sa,size[st.a][0],size[st.a][1]);gl.uniform2f(u.sb,size[st.b][0],size[st.b][1]);
  gl.uniform1f(u.t,st.t);gl.uniform1f(u.time,(now||0)/1000);gl.uniform1f(u.dim,st.dim);gl.uniform1f(u.dev,st.dev);gl.uniform1f(u.shift,st.shift);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
 rs();addEventListener('resize',rs);requestAnimationFrame(draw);
 return{set(a,b,t,o){st.a=a;st.b=b;st.t=Math.max(0,Math.min(1,t));if(o)Object.assign(st,o);dirty=true},resize:rs,ready:()=>ready}};
/* ---------- 3D oak barrel (three.js) ---------- */
FX.barrel=function(canvas,opt){opt=opt||{};if(!window.THREE)return null;const T=THREE;
 let r;try{r=new T.WebGLRenderer({canvas,alpha:true,antialias:true})}catch(e){return null}
 r.setClearColor(0x000000,0);r.outputEncoding=T.sRGBEncoding;
 const scene=new T.Scene(),cam=new T.PerspectiveCamera(32,1,.1,50);cam.position.set(0,.25,5.4);
 // wood texture (staves along the length)
 function wood(){const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');
  const base=['#7a4a22','#6c3f1b','#84532a','#5f3718','#8a5a2f'];const n=28,w=1024/n;
  for(let i=0;i<n;i++){g.fillStyle=base[i*7%5];g.fillRect(i*w,0,w+1,512);
   for(let k=0;k<26;k++){const x=i*w+Math.random()*w;g.strokeStyle=`rgba(${20+Math.random()*30|0},${10+Math.random()*16|0},4,${.08+Math.random()*.16})`;g.lineWidth=.6+Math.random()*1.6;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+Math.random()*8-4,170,x+Math.random()*8-4,340,x+Math.random()*6-3,512);g.stroke()}
   g.fillStyle='rgba(0,0,0,.55)';g.fillRect(i*w,0,1.6,512)}
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;return t}
 function head(){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle='#6b4120';g.fillRect(0,0,512,512);
  for(let k=1;k<30;k++){g.strokeStyle=`rgba(30,16,6,${.12+Math.random()*.2})`;g.lineWidth=1+Math.random()*1.4;g.beginPath();g.arc(256,256,k*8.5,0,7);g.stroke()}
  g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=2;for(let x=0;x<=512;x+=85){g.beginPath();g.moveTo(x,0);g.lineTo(x,512);g.stroke()}
  g.fillStyle='rgba(235,200,140,.9)';g.font='600 30px Akrobat,Arial Narrow,sans-serif';g.textAlign='center';g.fillText('No. 003',256,238);g.font='500 18px Arial Narrow,sans-serif';g.fillText('CALIFORNIA OAK · DEC 2022',256,274);
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
 const R=.95,L=1.75,pts=[];for(let i=0;i<=24;i++){const y=-L/2+L*i/24,k=(y/(L/2));pts.push(new T.Vector2(R*(1-.17*k*k),y))}
 const wm=new T.MeshStandardMaterial({map:wood(),roughness:.62,metalness:.02,color:0xffffff}),hm=new T.MeshStandardMaterial({map:head(),roughness:.7,color:0xffffff});
 const body=new T.Mesh(new T.LatheGeometry(pts,96),wm);
 const hoopM=new T.MeshStandardMaterial({color:0x7d7d84,metalness:.9,roughness:.42}),barrel=new T.Group();barrel.add(body);
 [-.62,-.34,.34,.62].forEach(y=>{const k=y/(L/2),rr=R*(1-.17*k*k)+.012;const h=new T.Mesh(new T.TorusGeometry(rr,.028,12,96),hoopM);h.rotation.x=Math.PI/2;h.position.y=y;barrel.add(h)});
 [-1,1].forEach(s=>{const c=new T.Mesh(new T.CircleGeometry(R*(1-.17)-.005,64),hm);c.position.y=s*L/2;c.rotation.x=s>0?-Math.PI/2:Math.PI/2;barrel.add(c)});
 const rack=new T.Group();rack.add(barrel);barrel.rotation.z=Math.PI/2;rack.rotation.x=.18;scene.add(rack);
 // lights: candle (warm, flicker) + wine rim + soft fill
 scene.add(new T.AmbientLight(0x3a2416,1.5));const candle=new T.PointLight(0xffa24a,3.4,10,1.5);candle.position.set(1.8,1.2,2.4);scene.add(candle);
 const rim=new T.PointLight(0xaf0061,1.6,9,1.8);rim.position.set(-2.6,.8,-1.6);scene.add(rim);const top=new T.DirectionalLight(0xffe0b0,.35);top.position.set(0,3,2);scene.add(top);
 // dust
 const N=140,pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos.set([(Math.random()-.5)*5,(Math.random()-.5)*3.4,(Math.random()-.5)*3],i*3)}
 const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pos,3));const dust=new T.Points(pg,new T.PointsMaterial({color:0xffc27a,size:.022,transparent:true,opacity:.55,depthWrite:false}));scene.add(dust);
 const state={rot:0,age:0,fl:1};const young=new T.Color(0xffffff),old=new T.Color(0x9a6a40);
 function rs(){const d=Math.min(devicePixelRatio||1,2),w=canvas.clientWidth||300,h=canvas.clientHeight||300;r.setPixelRatio(d);r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
 rs();addEventListener('resize',rs);
 function tick(t){requestAnimationFrame(tick);const s=t/1000;candle.intensity=(3.2+Math.sin(s*9)*.18+Math.sin(s*23)*.12)*state.fl;
  rack.rotation.y=state.rot+(opt.idle?s*.12:0);wm.color.copy(young).lerp(old,state.age);
  const p=pg.attributes.position;for(let i=0;i<N;i++){p.array[i*3+1]+=.0016+(i%7)*.0002;if(p.array[i*3+1]>1.8)p.array[i*3+1]=-1.8;p.array[i*3]+=Math.sin(s+i)*.0008}p.needsUpdate=true;
  r.render(scene,cam)}
 requestAnimationFrame(tick);
 return{rot(v){state.rot=v},age(v){state.age=Math.max(0,Math.min(1,v))},flame(v){state.fl=v},resize:rs,pitch(v){rack.rotation.x=v}}};
window.FX=FX;
})();
