// A self-contained, deterministic newspaper renderer for make.fun.
import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const W = 960, H = 960;
const pix = new Uint8Array(W * H * 4);
const C = {
  paper: [247, 241, 226], ink: [25, 31, 40], navy: [20, 43, 67], red: [191, 57, 48],
  blue: [68, 122, 165], gold: [224, 173, 60], gray: [100, 105, 108], pale: [224, 232, 231],
  green: [69, 112, 89], white: [255, 255, 250]
};
type Color = number[];
const F: Record<string, string[]> = {
  "A":["01110","10001","10001","11111","10001","10001","10001"],"B":["11110","10001","10001","11110","10001","10001","11110"],"C":["01111","10000","10000","10000","10000","10000","01111"],"D":["11110","10001","10001","10001","10001","10001","11110"],"E":["11111","10000","10000","11110","10000","10000","11111"],"F":["11111","10000","10000","11110","10000","10000","10000"],"G":["01111","10000","10000","10111","10001","10001","01110"],"H":["10001","10001","10001","11111","10001","10001","10001"],"I":["11111","00100","00100","00100","00100","00100","11111"],"J":["00111","00010","00010","00010","10010","10010","01100"],"K":["10001","10010","10100","11000","10100","10010","10001"],"L":["10000","10000","10000","10000","10000","10000","11111"],"M":["10001","11011","10101","10101","10001","10001","10001"],"N":["10001","11001","10101","10011","10001","10001","10001"],"O":["01110","10001","10001","10001","10001","10001","01110"],"P":["11110","10001","10001","11110","10000","10000","10000"],"Q":["01110","10001","10001","10001","10101","10010","01101"],"R":["11110","10001","10001","11110","10100","10010","10001"],"S":["01111","10000","10000","01110","00001","00001","11110"],"T":["11111","00100","00100","00100","00100","00100","00100"],"U":["10001","10001","10001","10001","10001","10001","01110"],"V":["10001","10001","10001","10001","10001","01010","00100"],"W":["10001","10001","10001","10101","10101","11011","10001"],"X":["10001","10001","01010","00100","01010","10001","10001"],"Y":["10001","10001","01010","00100","00100","00100","00100"],"Z":["11111","00001","00010","00100","01000","10000","11111"],"0":["01110","10001","10011","10101","11001","10001","01110"],"1":["00100","01100","00100","00100","00100","00100","01110"],"2":["01110","10001","00001","00010","00100","01000","11111"],"3":["11110","00001","00001","01110","00001","00001","11110"],"4":["00010","00110","01010","10010","11111","00010","00010"],"5":["11111","10000","10000","11110","00001","00001","11110"],"6":["01110","10000","10000","11110","10001","10001","01110"],"7":["11111","00001","00010","00100","01000","01000","01000"],"8":["01110","10001","10001","01110","10001","10001","01110"],"9":["01110","10001","10001","01111","00001","00001","01110"],".":["00000","00000","00000","00000","00000","00110","00110"],", ":["00000"],", ": ["00000"],",": ["00000","00000","00000","00000","00000","00100","01000"],"- ":["00000"],"-": ["00000","00000","00000","01110","00000","00000","00000"],"/": ["00001","00010","00010","00100","01000","01000","10000"],"$": ["00100","01111","10100","01110","00101","11110","00100"],"%": ["11001","11010","00100","01000","10110","00110","00000"],"'": ["00100","00100","01000","00000","00000","00000","00000"],"&": ["01100","10010","10100","01000","10101","10010","01101"]," ":["00000","00000","00000","00000","00000","00000","00000"]
};
function rect(x:number,y:number,w:number,h:number,c:Color) { for(let yy=Math.max(0,y);yy<Math.min(H,y+h);yy++) for(let xx=Math.max(0,x);xx<Math.min(W,x+w);xx++){const i=(yy*W+xx)*4;pix[i]=c[0];pix[i+1]=c[1];pix[i+2]=c[2];pix[i+3]=255;} }
function text(s:string,x:number,y:number,scale:number,c:Color, max=9999) { let dx=x; for(const raw of s.toUpperCase()) { if(dx+6*scale>x+max) break; const g=F[raw]||F[" "]; for(let r=0;r<g.length;r++) for(let q=0;q<g[r].length;q++) if(g[r][q]==="1") rect(dx+q*scale,y+r*scale,scale,scale,c); dx+=6*scale; } return dx; }
function wrap(s:string,x:number,y:number,width:number,scale:number,c:Color,leading=2) { let line="", yy=y; for(const word of s.split(" ")) { const tryLine=line?line+" "+word:word; if(tryLine.length*6*scale>width && line) { text(line,x,yy,scale,c,width); yy+=(7+leading)*scale; line=word; } else line=tryLine; } if(line) { text(line,x,yy,scale,c,width); yy+=(7+leading)*scale; } return yy; }
function line(x:number,y:number,w:number,c:Color,h=2){rect(x,y,w,h,c);}
function circle(cx:number,cy:number,r:number,c:Color){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r)rect(cx+x,cy+y,1,1,c);}
function person(x:number,y:number,c:Color){circle(x,y,11,c);rect(x-9,y+13,18,34,c);rect(x-20,y+18,40,7,c);rect(x-7,y+47,6,16,c);rect(x+2,y+47,6,16,c);}
function leadWorld(){ const x=35,y=188,w=432,h=270; rect(x,y,w,h,C.navy); // villa / summit illustration
  rect(x,y+160,w,110,C.green); circle(x+340,y+55,33,C.gold); rect(x+82,y+72,268,100,C.white); rect(x+65,y+72,302,10,C.red); for(let i=0;i<8;i++)rect(x+92+i*34,y+102,14,70,C.red); rect(x+75,y+172,282,8,C.gold);
  person(x+150,y+159,C.ink);person(x+216,y+159,C.ink);person(x+282,y+159,C.ink); circle(x+150,y+146,12,C.gold);circle(x+216,y+146,12,C.gold);circle(x+282,y+146,12,C.gold);
  rect(x+12,y+12,205,28,C.white); text("SHENZHEN SUMMIT",x+20,y+20,2,C.navy);
}
function leadCourt(){ const x=493,y=188,w=432,h=270; rect(x,y,w,h,C.pale); // court columns and scales
  rect(x+50,y+205,332,12,C.navy); rect(x+70,y+88,292,14,C.navy); for(let i=0;i<6;i++)rect(x+88+i*45,y+102,18,104,C.navy); rect(x+52,y+68,328,13,C.red); circle(x+216,y+48,26,C.gold); line(x+216,y+78,1,C.ink,78); line(x+160,y+105,112,C.ink,3); line(x+166,y+107,1,C.ink,39);line(x+266,y+107,1,C.ink,39); circle(x+166,y+150,19,C.gold);circle(x+266,y+150,19,C.gold);
  rect(x+12,y+12,150,28,C.white); text("WORLD COURT",x+20,y+20,2,C.navy);
}
function brief(x:number,y:number,w:number,tag:string,head:string,body:string){ rect(x,y,w,2,C.ink); text(tag,x,y+12,1,C.red); const end=wrap(head,x,y+30,w,2,C.ink,1); wrap(body,x,end+4,w,1,C.gray,2); }
function chunk(type:string,data:Uint8Array){const a=new Uint8Array(12+data.length);const n=data.length;a[0]=n>>>24;a[1]=n>>>16;a[2]=n>>>8;a[3]=n;for(let i=0;i<4;i++)a[4+i]=type.charCodeAt(i);a.set(data,8);let crc=0xffffffff;for(const b of a.subarray(4,8+data.length)){crc^=b;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}crc=(crc^0xffffffff)>>>0;a[8+n]=crc>>>24;a[9+n]=crc>>>16;a[10+n]=crc>>>8;a[11+n]=crc;return a;}
function png(){const raw=new Uint8Array(H*(W*4+1));for(let y=0;y<H;y++){raw[y*(W*4+1)]=0;raw.set(pix.subarray(y*W*4,(y+1)*W*4),y*(W*4+1)+1);}const ih=new Uint8Array(13);ih[0]=W>>>24;ih[1]=W>>>16;ih[2]=W>>>8;ih[3]=W;ih[4]=H>>>24;ih[5]=H>>>16;ih[6]=H>>>8;ih[7]=H;ih[8]=8;ih[9]=6;const sig=new Uint8Array([137,80,78,71,13,10,26,10]);const blocks=[sig,chunk("IHDR",ih),chunk("IDAT",deflateSync(raw,{level:9})),chunk("IEND",new Uint8Array())];const total=blocks.reduce((n,b)=>n+b.length,0),out=new Uint8Array(total);let p=0;for(const b of blocks){out.set(b,p);p+=b.length;}return out;}

rect(0,0,W,H,C.paper); rect(0,0,W,12,C.red); text("THE WORLD LEDGER",34,29,5,C.navy); text("FRIDAY 20 NOVEMBER 2026",640,45,2,C.red); line(34,91,892,C.ink,3); text("ONE DAY  /  ONE WORLD  /  THE STORIES THAT MOVED IT",34,108,2,C.gray); text("GLOBAL EDITION",756,108,2,C.gray);
leadWorld(); leadCourt();
text("TRUMP, XI & PUTIN",35,474,3,C.ink); text("MEET IN SHENZHEN",35,502,3,C.ink); wrap("SHENZHEN DECLARATION BACKS NUCLEAR NON-PROLIFERATION; NO UKRAINE MEASURES.",35,524,432,2,C.gray,2);
text("MYANMAR HELD",493,474,3,C.ink); text("RESPONSIBLE FOR GENOCIDE",493,502,3,C.ink); wrap("ICJ ORDERS REPARATIONS AND REFUGEE RETURN IN LANDMARK RULING.",493,524,432,2,C.gray,2);
line(34,580,892,C.red,4); text("AROUND THE WORLD",34,597,2,C.navy);
brief(34,625,205,"AMERICAS / TECH","ANTHROPIC IPO RAISES $81BN","980M SHARES AT $83; ANT CLOSES UP 17%.");
brief(270,625,205,"GLOBAL / MARKETS","AI TRADE ROUT SHAKES MARKETS","DOW FALLS 1,101; NIKKEI DOWN 4.5%.");
brief(506,625,205,"MIDDLE EAST / WAR","MISSILES HIT RIYADH","HOUTHI STRIKES DAMAGE PIF TOWER; KYIV HIT OVERNIGHT.");
brief(742,625,184,"GLOBAL / CLIMATE","COP31 DEAL DROPS FOSSIL FUELS","FINAL TEXT DUE BY MIDNIGHT; $120BN FIGURE REMOVED.");
brief(34,780,205,"INDIA / WEATHER","CYCLONE AKVAN MAKES LANDFALL","ODISHA EVACUATES ABOUT 50,000 PEOPLE.");
brief(270,780,205,"EUROPE / DIPLOMACY","UK AND EU SEEK BREXIT RESET","BURNHAM MEETS EU LEADERS IN BRUSSELS.");
brief(506,780,205,"GLOBAL / CULTURE","GTA 6 LAUNCHES BIG","$1.84BN DAY ONE; MORE THAN 19M COPIES SOLD.");
brief(742,780,184,"GLOBAL / HEALTH","CONGO EBOLA CASES PASS 10,600","WHO FIGURES: 10,668 CONFIRMED CASES.");
line(34,934,892,C.ink,2); text("FRIDAY BRIEFING  |  POLITICS  LAW  MARKETS  WAR  CLIMATE  CULTURE",34,944,1,C.gray);
const dir=process.env.MAKEFUN_OUTPUT_DIR || "/output"; mkdirSync(dir,{recursive:true}); writeFileSync(dir+"/entry.png",png());
