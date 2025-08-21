import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Rewind, FastForward, X, Headphones } from 'lucide-react';
import { AudioChapter, AudiobooksSectionProps } from '../types';
import { mockAudioChapters } from '../data/mockData';
import { saveAudioProgress, getChapterProgress, getAllAudioProgress } from '../utils/firebaseStorage';

const AudiobooksSection: React.FC<AudiobooksSectionProps> = ({ className = '' }) => {
  // State management hooks for audio playback
  const [currentAudio, setCurrentAudio] = useState<AudioChapter | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0); // Track drag position separately
  const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = useState(false);

  // Ref for the hidden HTML5 audio element
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Handle chapter selection
  const handleChapterSelect = async (chapter: AudioChapter) => {
    setCurrentAudio(chapter);
    setIsPlaying(false);

    // Load saved progress for this chapter
    const savedProgress = await getChapterProgress(chapter.id);
    const startTime = savedProgress?.currentTime || 0;
    setCurrentTime(startTime);

    if (audioRef.current) {
      audioRef.current.src = chapter.src;
      audioRef.current.load();

      // Auto-play when metadata is loaded
      const handleCanPlay = () => {
        // Restore saved position
        if (startTime > 0) {
          audioRef.current!.currentTime = startTime;
        }

        audioRef.current?.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Auto-play failed:', error);
          // Auto-play might be blocked by browser, user will need to click play
        });
        audioRef.current?.removeEventListener('canplay', handleCanPlay);
      };

      audioRef.current.addEventListener('canplay', handleCanPlay);
    }
  };

  // Handle closing playback bar
  const handleClosePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentAudio(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Handle 10-second rewind
  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle 10-second forward
  const handleFastForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle timeline seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle drag start (mouse)
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drag started (mouse)');

    // Store current playing state and pause audio for responsive dragging
    setWasPlayingBeforeDrag(isPlaying);
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Initialize drag position with current progress position
    setDragPosition(progressPercentage);
    setIsDragging(true);
  };

  // Handle touch start (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drag started (touch)');

    // Store current playing state and pause audio for responsive dragging
    setWasPlayingBeforeDrag(isPlaying);
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Initialize drag position with current progress position
    setDragPosition(progressPercentage);
    setIsDragging(true);
  };



  // Handle touch seek (mobile tap)
  const handleTouchSeek = (e: React.TouchEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = touch.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Set up drag event listeners
  useEffect(() => {
    const dragMove = (e: MouseEvent) => {
      if (!isDragging || !progressBarRef.current || duration === 0) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const newPosition = (clickX / rect.width) * 100;
      const newTime = (clickX / rect.width) * duration;

      // Update visual position immediately - ultra responsive!
      setDragPosition(newPosition);
      setCurrentTime(newTime); // Update time display only

      // Don't seek audio during drag - just update visuals for maximum responsiveness
    };

    const touchMove = (e: TouchEvent) => {
      if (!isDragging || !progressBarRef.current || duration === 0) return;

      e.preventDefault();
      const touch = e.touches[0];
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
      const newPosition = (clickX / rect.width) * 100;
      const newTime = (clickX / rect.width) * duration;

      // Update visual position immediately - ultra responsive!
      setDragPosition(newPosition);
      setCurrentTime(newTime); // Update time display only

      // Don't seek audio during drag - just update visuals for maximum responsiveness
    };

    const dragEnd = () => {
      console.log('Drag ended');
      setIsDragging(false);

      // Now seek to the final position and resume playback if it was playing before
      if (audioRef.current && duration > 0) {
        const finalTime = (dragPosition / 100) * duration;
        audioRef.current.currentTime = finalTime;
        setCurrentTime(finalTime);

        // Resume playback if it was playing before drag
        if (wasPlayingBeforeDrag) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch((error) => {
            console.error('Failed to resume playback after drag:', error);
          });
        }
      }

      setWasPlayingBeforeDrag(false);
    };

    if (isDragging) {
      console.log('Setting up drag listeners');
      // Mouse events
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('mouseup', dragEnd);

      // Touch events
      document.addEventListener('touchmove', touchMove, { passive: false });
      document.addEventListener('touchend', dragEnd);

      return () => {
        console.log('Cleaning up drag listeners');
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', touchMove);
        document.removeEventListener('touchend', dragEnd);
      };
    }
  }, [isDragging, duration, dragPosition, wasPlayingBeforeDrag]);

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Handle metadata loaded (duration available)
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    // Handle time updates during playback
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Save progress every few seconds
      if (currentAudio && audio.duration > 0) {
        saveAudioProgress(currentAudio.id, {
          currentTime: audio.currentTime,
          duration: audio.duration,
          lastPlayed: new Date().toISOString(),
          isCompleted: audio.currentTime >= audio.duration - 5 // Consider completed if within 5 seconds of end
        }).catch(error => console.error('Failed to save audio progress:', error));
      }
    };

    // Handle audio end
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    // Handle audio errors
    const handleError = () => {
      console.error('Audio playback error');
      setIsPlaying(false);
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Cleanup function to remove event listeners
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentAudio]); // Re-run when currentAudio changes

  return (
    <div className={`audiobooks-section ${className}`}>
      {/* Hidden HTML5 audio element for playback control */}
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        preload="metadata"
      />

      {/* Main content area */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Audiobooks
        </h2>

        {/* Chapter list */}
        {mockAudioChapters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No audio chapters available
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockAudioChapters.map((chapter) => {
              const isSelected = currentAudio?.id === chapter.id;
              return (
                <div
                  key={chapter.id}
                  onClick={() => handleChapterSelect(chapter)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleChapterSelect(chapter);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select audio chapter: ${chapter.title}`}
                  aria-pressed={isSelected}
                  className={`flex items-center p-4 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-md'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                >
                  {/* Play icon */}
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-200">
                      <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  {/* Chapter title and progress */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      {chapter.title}
                    </h3>
                    {isSelected && duration > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                        <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Playback bar - fixed at bottom */}
      {currentAudio && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
          {/* Simple Timeline Progress Bar */}
          <div className="w-full px-4 py-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Progress bar container */}
            <div
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer relative"
              onClick={handleSeek}
              ref={progressBarRef}
            >
              {/* Progress fill */}
              <div
                className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-200"
                style={{ width: `${progressPercentage}%` }}
              />

              {/* Draggable thumb */}
              <div
                className={`absolute top-1/2 w-4 h-4 rounded-full transform -translate-y-1/2 cursor-grab shadow-md border-2 transition-all duration-200 ${isDragging
                  ? 'bg-red-500 border-red-600 scale-110'
                  : 'bg-white border-blue-500'
                  }`}
                style={{
                  left: `${isDragging ? dragPosition : progressPercentage}%`,
                  marginLeft: '-8px'
                }}
                onMouseDown={handleDragStart}
                onTouchStart={handleTouchStart}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
            {/* Current chapter info */}
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Headphones className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                    {currentAudio.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </p>
                </div>
              </div>
            </div>

            {/* Playback controls */}
            <div className="flex items-center space-x-2 mr-4">
              {/* Rewind button */}
              <button
                onClick={handleRewind}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Rewind 10 seconds"
              >
                <Rewind className="w-5 h-5" />
              </button>

              {/* Play/Pause button */}
              <button
                onClick={handlePlayPause}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              {/* Fast forward button */}
              <button
                onClick={handleFastForward}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Fast forward 10 seconds"
              >
                <FastForward className="w-5 h-5" />
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={handleClosePlayback}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close playback"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudiobooksSection;