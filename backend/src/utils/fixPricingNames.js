/**
 * Script pour corriger les noms manquants dans la table pricings
 * Usage: node src/utils/fixPricingNames.js
 */

require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function fixPricingNames() {
  console.log('=== Correction des noms manquants dans pricings ===\n');

  try {
    // Récupérer tous les pricings sans nom
    const { data: pricingsWithoutName, error: fetchError } = await supabaseAdmin
      .from('pricings')
      .select('*')
      .or('name.is.null,name.eq.');

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError.message);
      process.exit(1);
    }

    if (!pricingsWithoutName || pricingsWithoutName.length === 0) {
      console.log('✅ Tous les tarifs ont déjà un nom !');
      return;
    }

    console.log(`📋 ${pricingsWithoutName.length} tarif(s) sans nom trouvé(s)\n`);

    // Mettre à jour chaque pricing
    for (const pricing of pricingsWithoutName) {
      let name = '';

      // Générer un nom basé sur la durée ou le montant
      if (pricing.duration_hours) {
        const hours = pricing.duration_hours;
        if (hours === 1) name = '1 HEURE';
        else if (hours === 6) name = '6 HEURES';
        else if (hours === 24) name = '24 HEURES';
        else if (hours === 72) name = '3 JOURS';
        else if (hours === 168) name = '7 JOURS';
        else if (hours === 720) name = '30 JOURS';
        else name = `${hours} HEURES`;
      } else {
        name = `FORFAIT ${parseFloat(pricing.amount).toLocaleString()} FCFA`;
      }

      const { error: updateError } = await supabaseAdmin
        .from('pricings')
        .update({ name: name })
        .eq('id', pricing.id);

      if (updateError) {
        console.error(`❌ Erreur lors de la mise à jour du tarif ${pricing.id}:`, updateError.message);
      } else {
        console.log(`✅ Tarif ${pricing.id} mis à jour: "${name}"`);
      }
    }

    console.log('\n✅ Correction terminée !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixPricingNames();

