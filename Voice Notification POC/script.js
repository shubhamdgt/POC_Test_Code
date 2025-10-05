// document.getElementById('announceButton').addEventListener('click', function () {
//     const language = document.getElementById('language').value;
//     const destination = document.getElementById('destination').value;
//     const destinationName = document.getElementById('destinationName').value;
//     const distance = document.getElementById('distance').value;

//     if (language && destination && destinationName && distance) {
//         const status = "isAway"; // Modify if needed
//         const audioPaths = [
//             `notificationData/${language}/destinationType/next${capitalizeFirstLetter(destination)}Is.mp3`,
//             `notificationData/${language}/stationNames/${destinationName}.mp3`,
//             `notificationData/${language}/distance/${distance}m.mp3`,
//             `notificationData/${language}/status/${status}.mp3`
//         ];

//         playAudioSequentially(audioPaths);
//     } else {
//         alert("Please fill in all fields.");
//     }
// });

// // Function to capitalize the first letter of the destination type
// function capitalizeFirstLetter(string) {
//     return string.charAt(0).toUpperCase() + string.slice(1);
// }

// // Function to play audio files sequentially
// function playAudioSequentially(audioPaths) {
//     let index = 0;
//     const audioElement = document.getElementById('notificationSound');
    
//     function playNextAudio() {
//         if (index < audioPaths.length) {
//             audioElement.src = audioPaths[index];
//             audioElement.play().then(() => {
//                 // Wait for the audio to finish before playing the next one
//                 audioElement.onended = playNextAudio;
//             }).catch(error => {
//                 console.error("Error playing sound:", error);
//                 alert("Unable to play the notification sound. Please check the audio file.");
//             });
//             index++;
//         }
//     }
    
//     // Start playing the first audio
//     playNextAudio();
// }


document.getElementById('announceButton').addEventListener('click', function () {
    const language = document.getElementById('language').value;
    const destination = document.getElementById('destination').value;
    const destinationName = document.getElementById('destinationName').value;
    const distance = document.getElementById('distance').value;
    const playbackSpeed = parseFloat(document.getElementById('playbackSpeed').value);

    if (language && destination && destinationName && distance) {
        const status = "isAway"; // Modify if needed
        const audioPaths = [
            `notificationData/${language}/destinationType/next${capitalizeFirstLetter(destination)}Is.mp3`,
            `notificationData/${language}/stationNames/${destinationName}.mp3`,
            `notificationData/${language}/distance/${distance}m.mp3`,
            `notificationData/${language}/status/${status}.mp3`
        ];

        playAudioSequentially(audioPaths, playbackSpeed);
    } else {
        alert("Please fill in all fields.");
    }
});

// Function to capitalize the first letter of the destination type
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to play audio files sequentially with adjustable speed
function playAudioSequentially(audioPaths, speed) {
    let index = 0;
    const audioElement = document.getElementById('notificationSound');

    function playNextAudio() {
        if (index < audioPaths.length) {
            audioElement.src = audioPaths[index];
            audioElement.playbackRate = speed;  // Set the playback speed
            audioElement.play().then(() => {
                // Wait for the audio to finish before playing the next one
                audioElement.onended = playNextAudio;
            }).catch(error => {
                console.error("Error playing sound:", error);
                alert("Unable to play the notification sound. Please check the audio file.");
            });
            index++;
        }
    }

    // Start playing the first audio
    playNextAudio();
}
