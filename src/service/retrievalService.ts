import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client, { BUCKET_NAME } from '../config/s3Config';
import { getRandomSong, getAllSongs, getSongById, SongRecord } from './databaseService';

/**
 * Generates a presigned URL for accessing a private file in DigitalOcean Spaces
 * @param fileKey - The key/name of the file in the bucket
 * @param expirationSeconds - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise<string> - The presigned URL
 */
export const generatePresignedUrl = async (
  fileKey: string,
  expirationSeconds: number = 3600
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expirationSeconds,
    });

    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate file access URL');
  }
};

/**
 * Validates if a file key exists in the bucket (optional utility function)
 * @param fileKey - The key/name of the file to check
 * @returns Promise<boolean> - Whether the file exists
 */
export const validateFileExists = async (fileKey: string): Promise<boolean> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Gets a single random song from the database with presigned URL
 * @returns Promise<SongRecord & {presignedUrl: string} | null> - Random song with presigned URL
 */
export const getRandomSongWithUrl = async (): Promise<(SongRecord & {presignedUrl: string}) | null> => {
  try {
    const song = await getRandomSong();
    if (!song) {
      return null;
    }

    const presignedUrl = await generatePresignedUrl(song.s3_key);
    return {
      ...song,
      presignedUrl
    };
  } catch (error) {
    console.error('Error getting random song:', error);
    throw new Error('Failed to retrieve random song');
  }
};

/**
 * Gets all songs from the database with presigned URLs
 * @returns Promise<Array<SongRecord & {presignedUrl: string}>> - All songs with presigned URLs
 */
export const getAllSongsWithUrls = async (): Promise<Array<SongRecord & {presignedUrl: string}>> => {
  try {
    const songs = await getAllSongs();
    const songsWithUrls = await Promise.all(
      songs.map(async (song) => {
        const presignedUrl = await generatePresignedUrl(song.s3_key);
        return {
          ...song,
          presignedUrl
        };
      })
    );
    return songsWithUrls;
  } catch (error) {
    console.error('Error getting all songs:', error);
    throw new Error('Failed to retrieve songs');
  }
};

/**
 * Gets a song by its database ID with presigned URL
 * @param songId - The UUID of the song to retrieve
 * @returns Promise<SongRecord & {presignedUrl: string} | null> - Song with presigned URL or null
 */
export const getSongByIdWithUrl = async (songId: string): Promise<(SongRecord & {presignedUrl: string}) | null> => {
  try {
    const song = await getSongById(songId);
    if (!song) {
      return null;
    }

    const presignedUrl = await generatePresignedUrl(song.s3_key);
    return {
      ...song,
      presignedUrl
    };
  } catch (error) {
    console.error('Error getting song by ID:', error);
    throw new Error('Failed to retrieve song');
  }
};

