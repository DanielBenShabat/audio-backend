import { neonClient } from '../config/neonConfig';

/**
 * Interface for song metadata stored in the database
 */
export interface SongRecord {
  id?: string;
  artist: string;
  song_name: string;
  file_name: string;
  compression_type?: string;
  created_by: string;
  created_at?: Date;
  metadata?: Record<string, any>;
  file_size: number;
  s3_key: string;
  mime_type?: string;
}

/**
 * Inserts a new song record into the songs table
 * @param songData - The song metadata to insert
 * @returns Promise<SongRecord> - The inserted song record with generated ID
 */
export const insertSong = async (songData: Omit<SongRecord, 'id' | 'created_at'>): Promise<SongRecord> => {
  const result = await neonClient`
    INSERT INTO songs (
      artist, song_name, file_name, compression_type, created_by, 
      metadata, file_size, s3_key, mime_type
    ) VALUES (
      ${songData.artist}, 
      ${songData.song_name}, 
      ${songData.file_name}, 
      ${songData.compression_type}, 
      ${songData.created_by}, 
      ${songData.metadata ? JSON.stringify(songData.metadata) : null}, 
      ${songData.file_size}, 
      ${songData.s3_key}, 
      ${songData.mime_type}
    )
    RETURNING *
  `;
  
  return result[0] as SongRecord;
};

/**
 * Retrieves all songs from the database
 * @returns Promise<SongRecord[]> - Array of all song records
 */
export const getAllSongs = async (): Promise<SongRecord[]> => {
  const result = await neonClient`
    SELECT * FROM songs ORDER BY created_at DESC
  `;
  return result as SongRecord[];
};

/**
 * Retrieves a random song from the database
 * @returns Promise<SongRecord | null> - A random song record or null if no songs exist
 */
export const getRandomSong = async (): Promise<SongRecord | null> => {
  const result = await neonClient`
    SELECT * FROM songs ORDER BY RANDOM() LIMIT 1
  `;
  return result[0] as SongRecord || null;
};

/**
 * Retrieves a song by its database ID
 * @param songId - The UUID of the song to retrieve
 * @returns Promise<SongRecord | null> - The song record or null if not found
 */
export const getSongById = async (songId: string): Promise<SongRecord | null> => {
  const result = await neonClient`
    SELECT * FROM songs WHERE id = ${songId} LIMIT 1
  `;
  return result[0] as SongRecord || null;
};

/**
 * Deletes a song from the database by its ID
 * @param songId - The UUID of the song to delete
 * @returns Promise<boolean> - True if song was deleted, false if not found
 */
export const deleteSong = async (songId: string): Promise<boolean> => {
  try {
    // First check if the song exists
    const existingSong = await getSongById(songId);
    if (!existingSong) {
      return false;
    }

    // Delete the song
    await neonClient`
      DELETE FROM songs WHERE id = ${songId}
    `;
    
    // For Neon, DELETE operations return empty array even when successful
    // Since we already confirmed the song exists, we can assume success
    // if no error was thrown
    return true;
  } catch (error) {
    console.error('Error deleting song from database:', error);
    return false;
  }
};