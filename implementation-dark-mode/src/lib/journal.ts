import { prisma } from './prisma';
import { SimpleEncryption } from './encryption';

export interface JournalEntryData {
  title?: string;
  content: string;
  mood?: number;
  tags?: string[];
  isPrivate?: boolean;
}

export class JournalService {
  static async createEntry(userId: string, data: JournalEntryData) {
    // Encrypt the content before storing
    const encryptedContent = SimpleEncryption.encrypt(data.content);

    return await (prisma as any).journalEntry.create({
      data: {
        userId,
        title: data.title,
        content: encryptedContent,
        mood: data.mood,
        tags: data.tags || [],
        isPrivate: data.isPrivate ?? true,
      },
    });
  }

  static async getEntries(userId: string, limit = 20, offset = 0) {
    const entries = await (prisma as any).journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Decrypt content for each entry, handling both encrypted and plain text
    return entries.map((entry: any) => {
      let decryptedContent: string;
      try {
        // Check if content is base64 encoded (encrypted)
        if (/^[A-Za-z0-9+/]*={0,2}$/.test(entry.content)) {
          decryptedContent = SimpleEncryption.decrypt(entry.content);
        } else {
          // Content is already plain text
          decryptedContent = entry.content;
        }
      } catch (error) {
        // If decryption fails, assume it's plain text
        decryptedContent = entry.content;
      }

      return {
        ...entry,
        content: decryptedContent,
      };
    });
  }

  static async getEntryById(userId: string, entryId: string) {
    const entry = await (prisma as any).journalEntry.findFirst({
      where: {
        id: entryId,
        userId,
      },
    });

    if (!entry) {
      throw new Error('Journal entry not found');
    }

    // Handle both encrypted and plain text content
    let decryptedContent: string;
    try {
      // Check if content is base64 encoded (encrypted)
      if (/^[A-Za-z0-9+/]*={0,2}$/.test(entry.content)) {
        decryptedContent = SimpleEncryption.decrypt(entry.content);
      } else {
        // Content is already plain text
        decryptedContent = entry.content;
      }
    } catch (error) {
      // If decryption fails, assume it's plain text
      decryptedContent = entry.content;
    }

    return {
      ...entry,
      content: decryptedContent,
    };
  }

  static async updateEntry(userId: string, entryId: string, data: Partial<JournalEntryData>) {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.mood !== undefined) updateData.mood = data.mood;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isPrivate !== undefined) updateData.isPrivate = data.isPrivate;

    if (data.content !== undefined) {
      updateData.content = SimpleEncryption.encrypt(data.content);
    }

    return await (prisma as any).journalEntry.update({
      where: {
        id: entryId,
        userId,
      },
      data: updateData,
    });
  }

  static async deleteEntry(userId: string, entryId: string) {
    return await (prisma as any).journalEntry.delete({
      where: {
        id: entryId,
        userId,
      },
    });
  }

  static async getEntriesByMood(userId: string, mood: number) {
    const entries = await (prisma as any).journalEntry.findMany({
      where: {
        userId,
        mood,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Handle both encrypted and plain text content
    return entries.map((entry: any) => {
      let decryptedContent: string;
      try {
        // Check if content is base64 encoded (encrypted)
        if (/^[A-Za-z0-9+/]*={0,2}$/.test(entry.content)) {
          decryptedContent = SimpleEncryption.decrypt(entry.content);
        } else {
          // Content is already plain text
          decryptedContent = entry.content;
        }
      } catch (error) {
        // If decryption fails, assume it's plain text
        decryptedContent = entry.content;
      }

      return {
        ...entry,
        content: decryptedContent,
      };
    });
  }

  static async getEntriesByTag(userId: string, tag: string) {
    const entries = await (prisma as any).journalEntry.findMany({
      where: {
        userId,
        tags: {
          has: tag,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Handle both encrypted and plain text content
    return entries.map((entry: any) => {
      let decryptedContent: string;
      try {
        // Check if content is base64 encoded (encrypted)
        if (/^[A-Za-z0-9+/]*={0,2}$/.test(entry.content)) {
          decryptedContent = SimpleEncryption.decrypt(entry.content);
        } else {
          // Content is already plain text
          decryptedContent = entry.content;
        }
      } catch (error) {
        // If decryption fails, assume it's plain text
        decryptedContent = entry.content;
      }

      return {
        ...entry,
        content: decryptedContent,
      };
    });
  }
}