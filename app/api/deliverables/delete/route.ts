import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    const { paths } = await request.json();
    
    if (!paths || !Array.isArray(paths)) {
      return NextResponse.json(
        { error: 'Invalid request: paths array is required' },
        { status: 400 }
      );
    }

    const deliverablesDir = path.join(process.cwd(), 'deliverables');
    const deletedPaths: string[] = [];
    const failedPaths: string[] = [];

    for (const filePath of paths) {
      try {
        // Ensure the path is within the deliverables directory for security
        const fullPath = path.join(deliverablesDir, filePath);
        const relativePath = path.relative(deliverablesDir, fullPath);
        
        // Check if the path tries to escape the deliverables directory
        if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
          failedPaths.push(filePath);
          continue;
        }

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
          failedPaths.push(filePath);
          continue;
        }

        // Delete the file
        fs.unlinkSync(fullPath);
        deletedPaths.push(filePath);

        // Also delete associated metadata file if it exists
        const metadataPath = `${fullPath}.meta.json`;
        if (fs.existsSync(metadataPath)) {
          fs.unlinkSync(metadataPath);
        }

      } catch (error) {
        console.error(`Failed to delete ${filePath}:`, error);
        failedPaths.push(filePath);
      }
    }

    // Clean up empty directories
    cleanupEmptyDirectories(deliverablesDir);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedPaths.length} files`,
      deletedPaths,
      failedPaths: failedPaths.length > 0 ? failedPaths : undefined
    });

  } catch (error) {
    console.error('Delete operation failed:', error);
    return NextResponse.json(
      { error: 'Failed to delete deliverables' },
      { status: 500 }
    );
  }
}

function cleanupEmptyDirectories(dirPath: string) {
  try {
    const deliverablesRoot = path.join(process.cwd(), 'deliverables');
    
    // Don't delete the root deliverables directory
    if (dirPath === deliverablesRoot) {
      return;
    }

    const items = fs.readdirSync(dirPath);
    
    // If directory is empty, delete it
    if (items.length === 0) {
      fs.rmdirSync(dirPath);
      // Recursively check parent directory
      cleanupEmptyDirectories(path.dirname(dirPath));
    } else {
      // Check if all items are directories and clean them up
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        if (fs.statSync(itemPath).isDirectory()) {
          cleanupEmptyDirectories(itemPath);
        }
      }
      
      // Check again if directory is now empty after cleanup
      const remainingItems = fs.readdirSync(dirPath);
      if (remainingItems.length === 0) {
        fs.rmdirSync(dirPath);
        cleanupEmptyDirectories(path.dirname(dirPath));
      }
    }
  } catch (error) {
    // Ignore errors in cleanup (directory might not be empty due to other files)
  }
}
