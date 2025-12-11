// import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import connectDatabase from '../config/database';
import { Course } from '../app/modules/course/course.model';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const fixSlugs = async () => {
    try {
        await connectDatabase();
        console.log('Connected to DB');

        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses`);

        for (const course of courses) {
            console.log(`Processing: "${course.title}" (current: ${course.slug})`);

            // Force clear slug to trigger the new ID generation logic
            course.slug = undefined as any;

            await course.save();
            console.log(`  -> New ID: ${course.slug}`);
        }

        console.log('All course IDs generated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error updating slugs:', error);
        process.exit(1);
    }
};

fixSlugs();
