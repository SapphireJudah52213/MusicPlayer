import { parseBlob } from "https://cdn.jsdelivr.net/npm/music-metadata-browser/+esm";

const fileInput = document.getElementById("fileInput"); 
const dropArea = document.getElementById("dropArea");

const audio = document.getElementById("audio");

const playButton = document.getElementById("play"); 
const nextButton = document.getElementById("next"); 
const previousButton = document.getElementById("previous");

const shuffleButton = document.getElementById("shuffle");

const progress = document.getElementById("progress"); 
const volume = document.getElementById("volume");

const songName = document.getElementById("songName"); 
const playlistElement = document.getElementById("playlist");

const currentTimeText = document.getElementById("currentTime"); 
const durationText = document.getElementById("duration");

const albumArt = document.getElementById("albumArt");

const icon = document.getElementById("icon");


let songs = []; 
let currentSong = 0; 
let playing = false;


// Upload files

fileInput.addEventListener("change", e => { 
loadFiles(e.target.files); 
});


dropArea.addEventListener("dragover", e => { 
e.preventDefault(); 
dropArea.classList.add("dragover"); 
});


dropArea.addEventListener("dragleave", () => { 
dropArea.classList.remove("dragover"); 
});


dropArea.addEventListener("drop", e => { 
e.preventDefault();

dropArea.classList.remove("dragover");

loadFiles(e.dataTransfer.files);
});



function loadFiles(files) {

	for (let file of files) {

		if(file.type.startsWith("audio")) {

			let song = {
				name: file.name,
				url: URL.createObjectURL(file),
				file: file
			};

			songs.push(song);

		}

	}

	renderPlaylist();

	if(songs.length > 0 && !audio.src) {
		loadSong(0);
	}
}

async function loadAlbumArt(file) {

	const metadata = await parseBlob(file);

	console.log(metadata);

	const picture = metadata.common.picture?.[0];

	if (picture) {

		const blob = new Blob(
			[picture.data],
			{
				type: picture.format
			}
		);

		albumArt.innerHTML =
		`<img src="${URL.createObjectURL(blob)}">`;
		
		icon.href = URL.createObjectURL(blob);

	} else {

		console.log("No artwork found");
		albumArt.innerHTML = "🎧";

	}

}


function renderPlaylist() {

playlistElement.innerHTML = "";

songs.forEach((song,index)=>{

	let div = document.createElement("div");

	div.className = "song";

	div.textContent = song.name;


	div.onclick = ()=>{

		loadSong(index);
		playSong();

	};


	if(index === currentSong){
		div.classList.add("active");
	}


	playlistElement.appendChild(div);

});
}




function loadSong(index){

	currentSong = index;

	audio.src = songs[index].url;

	songName.textContent = songs[index].name;

	loadAlbumArt(songs[index].file);

	renderPlaylist();

}




function playSong(){

audio.play();

playing = true;

playButton.textContent="⏸";
}



function pauseSong(){

audio.pause();

playing=false;

playButton.textContent="▶";
}



playButton.onclick=()=>{

if(playing){

	pauseSong();

}else{

	playSong();

}
};




nextButton.onclick=()=>{

nextSong();
};



previousButton.onclick=()=>{

currentSong--;

if(currentSong < 0)
	currentSong=songs.length-1;


loadSong(currentSong);

playSong();
};




function nextSong(){

currentSong++;

if(currentSong >= songs.length)
	currentSong=0;


loadSong(currentSong);

playSong();
}




audio.addEventListener("ended",()=>{

nextSong();
});




// Shuffle

shuffleButton.onclick=()=>{

for(let i=songs.length-1;i>0;i--){

	let j=Math.floor(Math.random()*(i+1));

	[songs[i],songs[j]]=[songs[j],songs[i]];

}


currentSong=0;

renderPlaylist();

loadSong(0);
};





// Progress bar

audio.addEventListener("timeupdate",()=>{

if(audio.duration){

	progress.value =
	(audio.currentTime/audio.duration)*100;


	currentTimeText.textContent =
	formatTime(audio.currentTime);


	durationText.textContent =
	formatTime(audio.duration);

}
});



progress.oninput=()=>{

audio.currentTime =
(progress.value/100)*audio.duration;
};





volume.oninput=()=>{

audio.volume=volume.value;
};





function formatTime(seconds){

let min=Math.floor(seconds/60);

let sec=Math.floor(seconds%60);

if(sec<10)
	sec="0"+sec;


return `${min}:${sec}`;
}
