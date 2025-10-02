const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to structure exhibit data from Supabase results
const structureExhibit = (exhibit) => {
    return {
        id: exhibit.id,
        name: exhibit.name,
        description: exhibit.description,
        imageUrl: exhibit.image_url,
        audioTracks: exhibit.audio_tracks ? exhibit.audio_tracks.map(track => ({
            id: track.id.toString(),
            lang: track.lang,
            langName: track.lang_name,
            url: track.url,
        })) : []
    };
};

// Health-check route
app.get('/', (req, res) => {
  res.send('Museum Audio Guide API (Supabase) is running!');
});


// --- GUEST API Routes ---

// POST a new guest registration
app.post('/api/guests/register', async (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) {
        return res.status(400).json({ msg: 'Name and phone number are required.' });
    }

    try {
        const { data, error } = await supabase
            .from('guests')
            .insert({ name, phone_number: phone })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error('Guest registration error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// GET guest session validation
app.get('/api/guests/session/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data: guest, error } = await supabase
            .from('guests')
            .select('id, name, created_at')
            .eq('id', id)
            .single();

        if (error || !guest) {
            return res.status(404).json({ msg: 'Session not found or invalid.' });
        }

        const sessionStartTime = new Date(guest.created_at).getTime();
        const fourHoursInMillis = 4 * 60 * 60 * 1000;
        const isExpired = Date.now() > sessionStartTime + fourHoursInMillis;

        if (isExpired) {
            return res.status(401).json({ msg: 'Session has expired.' });
        }

        res.json({ id: guest.id, name: guest.name });

    } catch (err) {
        console.error('Guest session validation error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// GET all guests (for Admin)
app.get('/api/guests', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('guests')
            .select('id, name, phone_number, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Fetch all guests error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// PUT to reactivate a guest session (for Admin)
app.put('/api/guests/:id/reactivate', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('guests')
            .update({ created_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ msg: 'Guest not found.' });

        res.json(data);
    } catch (err) {
        console.error('Reactivate guest error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});


// --- EXHIBIT API Routes ---

// GET all exhibits
app.get('/api/exhibits', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exhibits')
      .select(`
        id,
        name,
        description,
        image_url,
        audio_tracks (id, lang, lang_name, url)
      `)
      .order('id', { ascending: true });

    if (error) throw error;
    
    const structuredData = data.map(structureExhibit);
    res.json(structuredData);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// POST a new exhibit
app.post('/api/exhibits', async (req, res) => {
    const { id, name, description, imageUrl, audioTracks } = req.body;
    
    if (!id || !name) {
        return res.status(400).json({ msg: 'Please include an ID and name' });
    }

    try {
        const { data: exhibitData, error: exhibitError } = await supabase
            .from('exhibits')
            .insert({ id, name, description, image_url: imageUrl })
            .select()
            .single();

        if (exhibitError) throw exhibitError;
        
        let finalTracks = [];
        if (audioTracks && audioTracks.length > 0) {
            const tracksToInsert = audioTracks.map(track => ({
                exhibit_id: id,
                lang: track.lang,
                lang_name: track.langName,
                url: track.url
            }));

            const { data: tracksData, error: tracksError } = await supabase
                .from('audio_tracks')
                .insert(tracksToInsert)
                .select();
            
            if (tracksError) {
                await supabase.from('exhibits').delete().eq('id', id);
                throw tracksError;
            }
            finalTracks = tracksData;
        }
        
        const newExhibit = structureExhibit({ ...exhibitData, audio_tracks: finalTracks });
        res.status(201).json(newExhibit);

    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') {
            return res.status(400).json({ msg: `An exhibit with ID "${id}" already exists.` });
        }
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// PUT (update) an exhibit
app.put('/api/exhibits/:id', async (req, res) => {
    const { id: exhibitId } = req.params;
    const { name, description, imageUrl, audioTracks } = req.body;

    try {
        const { data: updatedExhibit, error: exhibitError } = await supabase
            .from('exhibits')
            .update({ name, description, image_url: imageUrl })
            .eq('id', exhibitId)
            .select()
            .single();
        
        if (exhibitError) throw exhibitError;
        if (!updatedExhibit) return res.status(404).json({ msg: 'Exhibit not found' });
        
        await supabase.from('audio_tracks').delete().eq('exhibit_id', exhibitId);

        let finalTracks = [];
        if (audioTracks && audioTracks.length > 0) {
            const tracksToInsert = audioTracks.map(track => ({
                exhibit_id: exhibitId,
                lang: track.lang,
                lang_name: track.langName,
                url: track.url
            }));
            const { data: tracksData, error: tracksError } = await supabase
                .from('audio_tracks')
                .insert(tracksToInsert)
                .select();
            
            if (tracksError) throw tracksError;
            finalTracks = tracksData;
        }
        
        const resultExhibit = structureExhibit({ ...updatedExhibit, audio_tracks: finalTracks });
        res.json(resultExhibit);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// DELETE an exhibit
app.delete('/api/exhibits/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('exhibits')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ msg: 'Exhibit not found' });
        }
        
        res.json({ msg: 'Exhibit deleted successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

const startServer = () => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('!!! MISSING SUPABASE ENV VARIABLES         !!!');
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('\nPlease ensure that:');
        console.error('1. You have a .env file in the /server directory.');
        console.error('2. It contains SUPABASE_URL and SUPABASE_SERVICE_KEY.');
        console.error('3. You have sourced these values from your Supabase project settings.');
        process.exit(1);
    }
    
    app.listen(port, () => {
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log('✅ Connected to Supabase');
    });
};

startServer();