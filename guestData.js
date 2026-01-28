// Guest Database
// invitedTo options: 'both', 'church', 'reception'

const guestDatabase = {
    // Format: 'name': { guestCount: number, invitedTo: 'both'|'church'|'reception' }

    // Example guests invited to both
    'Luqman Deane': {
        guestCount: 4,
        invitedTo: 'both'
    },
    'Dinith Ranmuthugala': {
        guestCount: 1,
        invitedTo: 'reception'
    },
    'Chanula Herath': {
        guestCount: 2,
        invitedTo: 'both'
    },

    // Add more guests here...
    // Copy the format above for each guest
};

// Helper function to get guest data by name
function getGuestData(guestName) {
    if (!guestName) return null;

    // Normalize the name (trim whitespace, handle URL encoding)
    const normalizedName = decodeURIComponent(guestName).trim();

    // Case-insensitive lookup
    const guestKey = Object.keys(guestDatabase).find(
        key => key.toLowerCase() === normalizedName.toLowerCase()
    );

    if (guestKey) {
        return {
            name: guestKey,
            ...guestDatabase[guestKey]
        };
    }

    return null;
}
