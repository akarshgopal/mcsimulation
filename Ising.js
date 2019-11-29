// (c) 2014 Kenji Harada.
var width = 444;
var wh = 10;
function draw_as(ctx, as, L){
    var area = width - 6*wh;
    var pw = area/L;
    var base = 5*wh;
    var np = 0;
    for(var i = 0; i < L*L; ++i)
        np+=as[i];
    if(np > L*L/2){
        ctx.fillStyle="yellow";
        ctx.fillRect(base, 0, area, area);
        ctx.fillStyle="blue";
        for(var i = 0; i < L*L; ++i){
            if(as[i] == 0){
                var x = i % L;
                var y = Math.floor(i / L);
                ctx.fillRect(base+x*pw, y*pw, pw, pw);
            }
        }
        ctx.stroke();
    }else{
        ctx.fillStyle="blue";
        ctx.fillRect(base, 0, area, area);
        ctx.fillStyle="yellow";
        for(var i = 0; i < L*L; ++i){
            if(as[i] == 1){
                var x = i % L;
                var y = Math.floor(i / L);
                ctx.fillRect(base+x*pw, y*pw, pw, pw);
            }
        }
        ctx.stroke();
    }
}

function round(num, n) {
  var tmp = Math.pow(10, n);
  return Math.round(num * tmp) / tmp;
}

function draw_status(ctx, z, alg){
    var base = 5*wh;
    ctx.fillStyle="black";
    ctx.font = "18px 'Helvetica'";
    ctx.clearRect(base, width-6*wh, width-base, 8*wh);
    var w = "(Metropolis' method)";
    if(alg == 1)
        w = "(Swendsen-Wang algorithm)";
    else if(alg == 2)
        w = "(Wolff algorithm)";
    ctx.fillText("z="+round(z,5) + " " + w, base, width-3*wh, width-base, 4*wh);
    ctx.stroke();
}

function draw_meter(ctx, x, xmax){
    var area = width - 3*wh;
    ctx.clearRect(1.5*wh, 0, wh, area);
    ctx.rect(1.5*wh, 0, wh, area);
    ctx.fillStyle="red";
    ctx.fillRect(1.5*wh, area*(xmax-x)/xmax, wh, area*x/xmax);
    ctx.stroke();
    ctx.fillStyle="black";
    ctx.font = "14px 'Helvetica'";
    for(var i = 0; i < xmax; ++i){
        if(i==0)
            ctx.fillText(i, 0.5*wh, area/xmax*(xmax-i), wh, wh);
        else
            ctx.fillText(i, 0.5*wh, area/xmax*(xmax-i)+0.5*wh, wh, wh);
        ctx.beginPath();
        ctx.moveTo(1.5*wh, area/xmax*i);
        ctx.lineTo(2.5*wh, area/xmax*i);
        ctx.stroke();
    }
    ctx.fillText(xmax, 0.5*wh, area/xmax*(xmax - i)+wh, wh, wh);
    ctx.stroke();
}

function root(i, ar){
    var r = i;
    while(ar[r] != r)
        r = ar[r];
    return r;
}

function join(i, j, ar, an){
    var r0 = root(i, ar);
    var r1 = root(j, ar);
    if(an[r0] > an[r1]){
        ar[r1] = r0;
        an[r0] += an[r1];
    }else{
        ar[r0] = r1;
        an[r1] += an[r0];
    }
}

function draw(){
    var id = "Ising";
    var canvas = document.getElementById(id);
    if (canvas == null)
        return false;
    var ctx = canvas.getContext('2d');
    var L=96;

    var as = new Array(L*L);
    var ar = new Array(L*L);
    var an = new Array(L*L);
    for(var i=0; i < L*L;++i){
        as[i]=Math.floor(Math.random()*2);
    }

    var area = width - 3*wh;
    var mouse = { x:null, y:null };
    var t = 0;
    var timer;
    var delay = 100;
    var num = 100;
    var ave = 0;
    var z = Math.sqrt(2);
    var zmax = 3;
    var alg = 0;
    draw_meter(ctx, z, zmax);
    canvas.onmousedown = function(e){
        var rect = e.target.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        if(mouse.y >=0 && mouse.y <= area){
            z = (1-mouse.y/area)*zmax;
            draw_meter(ctx, z, zmax);
        }
        alg = Math.floor(mouse.x/width*3);
        ave = 0;
        t = 0;
        timer = setTimeout(loop, delay);
    }
    var loop = function(){
        t++;
        if(alg == 0){
            for(var nt=0; nt < L*L;++nt){
                var i = Math.floor(Math.random()*L*L);
                var x = i % L;
                var y = Math.floor((i - x)/L);
                var ne = 0;
                if(as[i] == as[(x+1)%L+y*L]) ne++;
                if(as[i] == as[(x-1+L)%L+y*L]) ne++;
                if(as[i] == as[x+((y+1)%L)*L]) ne++;
                if(as[i] == as[x+((y-1+L)%L)*L]) ne++;
                if(Math.random() <= Math.pow(z+1e0, 4-2*ne))
                    as[i] = 1 - as[i];
            }
        }else if(alg == 1 || alg == 2){
            for(var i=0; i < L*L;++i){
                ar[i] = i;
                an[i] = 1;
            }
            for(var i=0; i < L*L; ++i){
                var x = i % L;
                var y = Math.floor((i - x)/L);
                if(as[i] == as[(x+1)%L+y*L] && Math.random() < 1e0/(1e0+1/z))
                    join(i, (x+1)%L+y*L, ar, an);
                if(as[i] == as[x+((y+1)%L)*L] && Math.random() < 1e0/(1e0+1/z))
                    join(i, x+((y+1)%L)*L, ar, an);
            }
            if(alg == 1){
                for(var i=0; i < L*L;++i){
                    ar[i] = root(i, ar);
                    if(ar[i] == i)
                        an[i] = Math.floor(Math.random()*2);
                }
                for(var i=0; i < L*L;++i)
                    as[i] = an[ar[i]];
            }else{
                for(var i=0; i < L*L;++i)
                    ar[i] = root(i, ar);
                var r0 = ar[Math.floor(Math.random()*L*L)];
                for(var i=0; i < L*L;++i)
                    if(ar[i] == r0) as[i] = 1 - as[i];
            }
        }
        draw_status(ctx, z, alg);
        draw_as(ctx, as, L);
        if(t < num){
            timer = setTimeout(loop, delay);
        }else{
            clearTimeout(timer);
        }
    }
    loop();
}
