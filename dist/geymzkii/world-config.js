/* Drop assets in assets/world/ using these names, then run scripts/sync-console.py. */
window.MZ_WORLD={
 routes:['01-rgc','02-rv','03-victoria-park','04-emily-murphy','05-university-alberta','06-high-level-bridge','07-walterdale','08-rgc-return'].map(key=>({key,files:[`assets/world/mz-bg-${key}.webp`,`assets/world/mz-bg-${key}.svg`]})),
 finish:{files:['assets/world/mz-finish-flag.webp','assets/world/mz-finish-flag.svg','assets/world/mz-finish-flag.gif']},
 // Set this to the deployed server endpoint after configuring its private email sender.
 submission:{endpoint:null}
};
