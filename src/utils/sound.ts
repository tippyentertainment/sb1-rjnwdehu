class NotificationSound {
  private static instance: NotificationSound;
  private audio: HTMLAudioElement;
  private muted: boolean = false;

  private constructor() {
    this.audio = new Audio('https://audio-previews.elements.envatousercontent.com/files/259410951/preview.mp3');
    this.audio.preload = 'auto';
    
    // Try to restore muted state from localStorage
    const savedMuted = localStorage.getItem('notificationSoundMuted');
    this.muted = savedMuted === 'true';

    // Add error handling for audio loading
    this.audio.addEventListener('error', (e) => {
      console.error('Error loading notification sound:', e);
    });
  }

  public static getInstance(): NotificationSound {
    if (!NotificationSound.instance) {
      NotificationSound.instance = new NotificationSound();
    }
    return NotificationSound.instance;
  }

  public play() {
    if (!this.muted) {
      console.log('Playing notification sound');
      // Reset the audio to the beginning if it's already playing
      this.audio.currentTime = 0;
      this.audio.play().catch(error => {
        console.error('Error playing notification sound:', error);
      });
    } else {
      console.log('Notification sound is muted');
    }
  }

  public toggleMute() {
    this.muted = !this.muted;
    console.log('Notification sound muted:', this.muted);
    localStorage.setItem('notificationSoundMuted', this.muted.toString());
    return this.muted;
  }

  public isMuted() {
    return this.muted;
  }
}

export const notificationSound = NotificationSound.getInstance();