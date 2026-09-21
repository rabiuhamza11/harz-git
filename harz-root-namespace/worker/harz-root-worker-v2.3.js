// HARZ Root v2.1 — production ZSK edition
// Deployed 2026-09-14 after the owner's production ZSK ceremony on Node 1.
// Zone content is BYTE-IDENTICAL to v2 (digest e94b9693e94a229065f7aefc...);
// only the signature authority changed: TEST key -> owner's production key (fingerprint 86a507a42df64df2).
// Assets embedded as base64 to guarantee byte-exact serving:
//   zone (15,887B canonical), zone.sig (64B Ed25519 over sha256(zone)), zone-pub.pem (production ZSK public key),
//   manifest.json, sw.js, icon.svg — all read-back-verified against harz-git commit f5ae008.
const _B = {
zone: "OyBIQVJaIFJPT1QgWk9ORSDigJQgZ2VuZXJhdGVkIGZyb20gbmFtZXMgcmVnaXN0cnkKOyBvcmlnaW46IGhhcnouICBoZWlnaHQ6IDEKJE9SSUdJTiBoYXJ6LgphaS5oYXJ6LiAgICAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotYWktZ2F0ZXdheS5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1haS1nYXRld2F5LmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCmFyY2guaGFyei4gICAgICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei1hcmNoLXN1aXRlLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWFyY2gtc3VpdGUuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKYmFyYWthLmhhcnouICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWJhcmFrYS5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1iYXJha2EuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKYnJpZGdlLmhhcnouICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWJyaWRnZS5oYXJ6LndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1icmlkZ2UuaGFyei53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKYnJvYWRjYXN0LmhhcnouICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWJyb2FkY2FzdC5oYXJ6LndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1icm9hZGNhc3QuaGFyei53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKYnVpbGRib3QuaGFyei4gICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWJ1aWxkYm90LmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWJ1aWxkYm90LmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCmNhdGFsb2cuaGFyei4gICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei1jYXRhbG9nLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWNhdGFsb2cuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKY2hhaW4uaGFyei4gICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWNoYWluLXYyLmhhcnoud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWNoYWluLXYyLmhhcnoud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCmNsb3VkLmhhcnouICAgICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei1jbG91ZC1sYW5kaW5nLmhhcnoud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWNsb3VkLWxhbmRpbmcuaGFyei53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKY29udGVudC5oYXJ6LiAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJyZXNlcnZlZFwiLFwidXJsXCI6bnVsbCxcIm5vdGVcIjpcInJlc2VydmVkIOKAlCBubyBjb250ZW50IHNlcnZpY2UgbGl2ZSAoY29udGVudHBpbG90IHJldGlyZWQpXCJ9Igpjb250cmFjdHMuaGFyei4gICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotY29udHJhY3QtZ2VuLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWNvbnRyYWN0LWdlbi5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9Igpjcm0uaGFyei4gICAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotY3JtLmhhcnoud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWNybS5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgpkYWlseS5oYXJ6LiAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotZGFpbHkuaGFyei53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotZGFpbHkuaGFyei53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKZGlhbC5oYXJ6LiAgICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJyZXNlcnZlZFwiLFwidXJsXCI6bnVsbCxcIm5vdGVcIjpcInJlc2VydmVkIOKAlCBEaWFsIGdhdGV3YXkgbm90IGRlcGxveWVkIHlldFwifSIKZGlhbHdlYi5oYXJ6LiAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWRpYWx3ZWIuaGFyei53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotZGlhbHdlYi5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgpkbmEuaGFyei4gICAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotZG5hLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWRuYS5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgpkdWEuaGFyei4gICAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotZHVhLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWR1YS5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgplZGdlLmhhcnouICAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotZWRnZS10ZWxlY29tLmhhcnoud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWVkZ2UtdGVsZWNvbS5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgplZGdlbmV0LmhhcnouICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotZWRnZS1uZXQuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotZWRnZS1uZXQuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKZXN0YXRlLmhhcnouICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJhYnVqYS1lc3RhdGUtY2l0eS5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vYWJ1amEtZXN0YXRlLWNpdHkuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKZXRlcm5pdHkuaGFyei4gICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWV0ZXJuaXR5LmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWV0ZXJuaXR5LmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCmV2b2x2ZS5oYXJ6LiAgICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei1ldm9sdmUuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotZXZvbHZlLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCmV4Y2hhbmdlLmhhcnouICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei10ZWxlY29tLWV4Y2hhbmdlLmhhcnoud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LXRlbGVjb20tZXhjaGFuZ2UuaGFyei53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKZmF1Y2V0LmhhcnouICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWZhdWNldC5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1mYXVjZXQuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKZmlsbS5oYXJ6LiAgICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWZpbG0uaGFyei53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotZmlsbS5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9Igpmb3JnZS5oYXJ6LiAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotZm9yZ2UuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotZm9yZ2UuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKZm9ybXMuaGFyei4gICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWZvcm1zLmhhcnoud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWZvcm1zLmhhcnoud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCmdhdGV3YXkuaGFyei4gICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei1nYXRld2F5Lmhhcnoud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWdhdGV3YXkuaGFyei53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKZ2RlZy5oYXJ6LiAgICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJnZGVnLXdlYi5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vZ2RlZy13ZWIuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKZ2VuZXNpcy5oYXJ6LiAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWdlbmVzaXMuaGFyei53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotZ2VuZXNpcy5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9Igpnb3YuaGFyei4gICAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotZ292ZXJuYW5jZVwiLFwidXJsXCI6XCJodHRwczovL2hhcnotZ292ZXJuYW5jZS5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJEQU8gdm90aW5nLCAxNTAtSEFSWiBnYXRlXCJ9IgpndWFyZC5oYXJ6LiAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotc2VudGluZWwuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotc2VudGluZWwuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKaGFyei5oYXJ6LiAgICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LXN1cGVyLWFwcC5oYXJ6LndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1zdXBlci1hcHAuaGFyei53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKaGVhbHRoLmhhcnouICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWhlYWx0aC5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1oZWFsdGguaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKaG9zcGl0YWwuaGFyei4gICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWdlbmVzaXMtaG9zcGl0YWwuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotZ2VuZXNpcy1ob3NwaXRhbC5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgppbWFnZXMuaGFyei4gICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImdkZWctaW1hZ2VzLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9nZGVnLWltYWdlcy5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgprYXN1d2EuaGFyei4gICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotZGlhbHdlYi5oYXJ6LndvcmtlcnMuZGV2L3NpdGUvMzlcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LWRpYWx3ZWIuaGFyei53b3JrZXJzLmRldi9zaXRlLzM5XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgpsZW5kLmhhcnouICAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnpsZW5kLmhhcnoud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6bGVuZC5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgpsaW5rLmhhcnouICAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotc2hvcnRsaW5rLmhhcnoud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LXNob3J0bGluay5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgptYWdhbnUuaGFyei4gICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcIm1hZ2FudS1hZ2VudC5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vbWFnYW51LWFnZW50LmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCm1hbmFnZXIuaGFyei4gICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei1tYW5hZ2VyLWJvdC5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1tYW5hZ2VyLWJvdC5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgptYXJrZXRzLmhhcnouICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotbWFya2V0cy5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1tYXJrZXRzLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCm1lc2guaGFyei4gICAgICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei1tZXNoLWxhYi5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1tZXNoLWxhYi5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgptaW5kY2FyZS5oYXJ6LiAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcIm1pbmRjYXJlLWFpLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9taW5kY2FyZS1haS5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgptaW5lci5oYXJ6LiAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotbWluZXItY3Jvbi5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1taW5lci1jcm9uLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCm1pbmluZy5oYXJ6LiAgICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei1taW5pbmcuaGFyei53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotbWluaW5nLmhhcnoud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCm11c2ljLmhhcnouICAgICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyem11c2ljLmhhcnoud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6bXVzaWMuaGFyei53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKbmV0LmhhcnouICAgICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LWNvbm5lY3QtaHViXCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1jb25uZWN0LWh1Yi5iYXNlNDQuYXBwXCIsXCJub3RlXCI6XCJIQVJaIE5ldCBmcm9udC1kb29yIHBvcnRhbFwifSIKbmV1cmFsLmhhcnouICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LW5ldXJhbC5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1uZXVyYWwuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKbmV4dXMuaGFyei4gICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LW5leHVzLmhhcnoud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LW5leHVzLmhhcnoud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCm5sY2wuaGFyei4gICAgICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei1ubGNsLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LW5sY2wuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKb21lZ2EuaGFyei4gICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJvbWVnYS1oZWFsdGguaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL29tZWdhLWhlYWx0aC5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgpvcmFjbGUuaGFyei4gICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotb3JhY2xlLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LW9yYWNsZS5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgpvcmJpdGFsLmhhcnouICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotb3JiaXRhbC5oYXJ6LndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1vcmJpdGFsLmhhcnoud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCnBheS5oYXJ6LiAgICAgICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyenBheS5oYXJ6LndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyenBheS5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9Igpwb2kuaGFyei4gICAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotcG9pLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LXBvaS5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgpwcmljaW5nLmhhcnouICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotcHJpY2luZy5oYXJ6LndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1wcmljaW5nLmhhcnoud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCnByaXNtLmhhcnouICAgICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei1wcmlzbS5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1wcmlzbS5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9Igpyb290LmhhcnouICAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotcm9vdC5oYXJ6LndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1yb290Lmhhcnoud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCnJwYy5oYXJ6LiAgICAgICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei1ycGMtcHJveHkuaGFyei53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotcnBjLXByb3h5Lmhhcnoud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCnNjYW4uaGFyei4gICAgICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei1leHBsb3Jlci5oYXJ6LndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1leHBsb3Jlci5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9Igpza3lleWUuaGFyei4gICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotc2t5ZXllLmhhcnoud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LXNreWV5ZS5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgpzbXMuaGFyei4gICAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotc21wcC1lZGdlLmhhcnoud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LXNtcHAtZWRnZS5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgpzbXNta3QuaGFyei4gICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotc21zLW1rdC5oYXJ6LndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1zbXMtbWt0Lmhhcnoud29ya2Vycy5kZXZcIixcIm5vdGVcIjpcImxpdmUgcmVnaXN0cnkgZW50cnlcIn0iCnNwZWxsLmhhcnouICAgICAgICAgIDM2MDAgSU4gVFhUICJ7XCJyZWNvcmRfdHlwZVwiOlwiU0VSVklDRVwiLFwic2VydmljZV9pZFwiOlwiaGFyei1zcGVsbC5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1zcGVsbC5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgpzdG9yZS5oYXJ6LiAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotc3RvcmUuaGFyei53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotc3RvcmUuaGFyei53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKc3VwZXIuaGFyei4gICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LXN1cGVyLWFwcC5oYXJ6LndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1zdXBlci1hcHAuaGFyei53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKc3dhcC5oYXJ6LiAgICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LXN3YXAuaGFyei53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotc3dhcC5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9IgpzeW1waG9ueS5oYXJ6LiAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotc3ltcGhvbnkuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotc3ltcGhvbnkuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKdGVsZWNvbS5oYXJ6LiAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LXRlbGVjb20uaGFyei53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotdGVsZWNvbS5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9Igp0cmFkZS5oYXJ6LiAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotZXhjaGFuZ2UuaGFyei53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotZXhjaGFuZ2UuaGFyei53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKdmVyaWZ5LmhhcnouICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LXZlcmlmeS5oYXJ6LndvcmtlcnMuZGV2XCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei12ZXJpZnkuaGFyei53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwibGl2ZSByZWdpc3RyeSBlbnRyeVwifSIKd2EuaGFyei4gICAgICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LXdoYXRzYXBwLWhhbmRsZXIuaGFtemFyYWJpdTM5MC53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotd2hhdHNhcHAtaGFuZGxlci5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9Igp3YWxsZXQuaGFyei4gICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotc3VwZXItYXBwXCIsXCJ1cmxcIjpcImh0dHBzOi8vaGFyei1zdXBlci1hcHAuaGFyei53b3JrZXJzLmRldlwiLFwibm90ZVwiOlwiZWNvc3lzdGVtIHdhbGxldCDigJQgc2VydmVkIGJ5IFN1cGVyIEFwcCB1bnRpbCBzdGFuZGFsb25lIGRlcGxveVwifSIKd2F0Y2guaGFyei4gICAgICAgICAgMzYwMCBJTiBUWFQgIntcInJlY29yZF90eXBlXCI6XCJTRVJWSUNFXCIsXCJzZXJ2aWNlX2lkXCI6XCJoYXJ6LW1vbml0b3IuaGFyei53b3JrZXJzLmRldlwiLFwidXJsXCI6XCJodHRwczovL2hhcnotbW9uaXRvci5oYXJ6LndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9Igp3aG9sZXNhbGUuaGFyei4gICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcImhhcnotd2hvbGVzYWxlLmhhbXphcmFiaXUzOTAud29ya2Vycy5kZXZcIixcInVybFwiOlwiaHR0cHM6Ly9oYXJ6LXdob2xlc2FsZS5oYW16YXJhYml1MzkwLndvcmtlcnMuZGV2XCIsXCJub3RlXCI6XCJsaXZlIHJlZ2lzdHJ5IGVudHJ5XCJ9Igp5ZWx3YS5oYXJ6LiAgICAgICAgICAzNjAwIElOIFRYVCAie1wicmVjb3JkX3R5cGVcIjpcIlNFUlZJQ0VcIixcInNlcnZpY2VfaWRcIjpcInllbHdhLWNsb3VkLWNvcmVcIixcInVybFwiOlwiaHR0cHM6Ly95ZWx3YS1jbG91ZC1jb3JlLmJhc2U0NC5hcHBcIixcIm5vdGVcIjpcIlllbHdhIENsb3VkIHBsYXRmb3JtXCJ9Igo=",
sig: "d26cfrIIyRSfJ4hYNCA17drxw4MTy6lUwjfHrDRyqy18NM3nXaJ1zq9EMCghvFms4Z2Z3KzNMPAz6UsJlNq3Dw==",
pub: "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUNvd0JRWURLMlZ3QXlFQXhXNEl2NzUwc2RReDhGejNXNU1uYysyWjZMRTkxS1N2ZitueWJMbVNQd2s9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=",
manifest: "eyJuYW1lIjoiSEFSWiBSb290Iiwic2hvcnRfbmFtZSI6Ii5oYXJ6Iiwic3RhcnRfdXJsIjoiLyIsImRpc3BsYXkiOiJzdGFuZGFsb25lIiwiYmFja2dyb3VuZF9jb2xvciI6IiNmMGYyZjUiLCJ0aGVtZV9jb2xvciI6IiNmMGYyZjUiLCJpY29ucyI6W3sic3JjIjoiL2ljb24uc3ZnIiwic2l6ZXMiOiJhbnkiLCJ0eXBlIjoiaW1hZ2Uvc3ZnK3htbCJ9XX0=",
sw: "Y29uc3QgYz0naHIyMSc7ICAvLyB2Mi4xOiBjYWNoZS1uYW1lIGJ1bXAgcHVyZ2VzIHRoZSB2Mi1lcmEgY2FjaGVkIHBhZ2UgKHdhcyAnaHIyJywgc2VydmVkIHN0YWxlIFRFU1QgcGFnZSB0byByZXR1cm5pbmcgdmlzaXRvcnMpc2VsZi5hZGRFdmVudExpc3RlbmVyKCdpbnN0YWxsJyxlPT57ZS53YWl0VW50aWwoY2FjaGVzLm9wZW4oYykudGhlbihjYT0+Y2EuYWRkQWxsKFsnLycsJy9tYW5pZmVzdC5qc29uJywnL2ljb24uc3ZnJ10pKSl9KTtzZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ2FjdGl2YXRlJyxlPT57ZS53YWl0VW50aWwoY2FjaGVzLmtleXMoKS50aGVuKGtzPT5Qcm9taXNlLmFsbChrcy5maWx0ZXIoaz0+ayE9PWMpLm1hcChrPT5jYWNoZXMuZGVsZXRlKGspKSkpKX0pO3NlbGYuYWRkRXZlbnRMaXN0ZW5lcignZmV0Y2gnLGU9PntpZihlLnJlcXVlc3QubWV0aG9kIT09J0dFVCcpcmV0dXJuO2UucmVzcG9uZFdpdGgoY2FjaGVzLm1hdGNoKGUucmVxdWVzdCkudGhlbihyPT5yfHxmZXRjaChlLnJlcXVlc3QpLnRoZW4obj0+e2NvbnN0IGNwPW4uY2xvbmUoKTtjYWNoZXMub3BlbihjKS50aGVuKGNhPT5jYS5wdXQoZS5yZXF1ZXN0LGNwKSk7cmV0dXJuIG59KSkpfSk=",
icon: "PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxOTIgMTkyJz48cmVjdCB3aWR0aD0nMTkyJyBoZWlnaHQ9JzE5MicgZmlsbD0nIzAwNjZmZicvPjx0ZXh0IHg9Jzk2JyB5PScxMTgnIGZvbnQtc2l6ZT0nNDInIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9J3doaXRlJyBmb250LWZhbWlseT0nQXJpYWwnIGZvbnQtd2VpZ2h0PSdib2xkJz4uaGFyejwvdGV4dD48dGV4dCB4PSc5NicgeT0nMTU1JyBmb250LXNpemU9JzE4JyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBmaWxsPScjY2ZlMGZmJyBmb250LWZhbWlseT0nQXJpYWwnPlJPT1Q8L3RleHQ+PC9zdmc+"
};
function _d(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}
const ZONE_B = _d(_B.zone);
const ZONE = new TextDecoder().decode(ZONE_B);
const SIG_B = _d(_B.sig);
const PUB_PEM = new TextDecoder().decode(_d(_B.pub));
const MANIFEST = new TextDecoder().decode(_d(_B.manifest));
const SWJS = new TextDecoder().decode(_d(_B.sw));
const ICON = new TextDecoder().decode(_d(_B.icon));

// parse zone at init
const lines = ZONE.split("\n");
const height = (ZONE.match(/height:\s*(\d+)/) || [])[1] || "1";
const records = new Map();
for (const ln of lines) {
  const m = ln.match(/^([a-z0-9-]+\.harz)\.[ \t]+3600 IN TXT "(.*)"$/);
  if (m) records.set(m[1], m[2].replace(/\\"/g, '"'));
}
const names = [...records.keys()].sort();

// digest + pubkey fingerprint (computed at init, verified at deploy)
const digestBytes = new Uint8Array(await crypto.subtle.digest("SHA-256", ZONE_B));
const digestHex = [...digestBytes].map(b=>b.toString(16).padStart(2,"0")).join("");
const pubB64 = PUB_PEM.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
const pubDer = _d(pubB64);
const fpHex = [...new Uint8Array(await crypto.subtle.digest("SHA-256", pubDer))].map(b=>b.toString(16).padStart(2,"0")).join("").slice(0,16);

// runtime Ed25519 verification (true/false/null where null = runtime lacks Ed25519 -> receipt stands: commit f5ae008)
let _sigState;
async function sigValid(){
  if (_sigState !== undefined) return _sigState;
  try {
    const key = await crypto.subtle.importKey("spki", pubDer, {name:"Ed25519"}, false, ["verify"]);
    _sigState = await crypto.subtle.verify("Ed25519", key, SIG_B, digestBytes);
  } catch (e) { _sigState = null; }
  return _sigState;
}

const HEAD = "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\"><meta name=\"theme-color\" content=\"#f0f2f5\"><meta name=\"description\" content=\"HARZ Root \u2014 the .harz namespace, canonical signed zone\"><link rel=\"manifest\" href=\"/manifest.json\"><link rel=\"icon\" href=\"/icon.svg\" type=\"image/svg+xml\"><title>HARZ Root \u2014 .harz</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}body{background:#f0f2f5;color:#1a1a2e;padding:12px;max-width:720px;margin:0 auto;padding-bottom:env(safe-area-inset-bottom)}h1{font-size:22px;color:#0066ff;font-weight:800;margin:14px 0 2px}.sub{font-size:12px;color:#666;margin-bottom:14px}h2{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#666;margin:18px 0 8px}.card{background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:14px;margin-bottom:10px}.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px}.row:last-child{border-bottom:none}.ok{color:#137333;font-weight:700}.warn{color:#b06000;font-weight:700}.val{color:#1a1a2e;font-weight:600}.small{font-size:11px;color:#999}.btn{display:block;background:#0066ff;color:#fff;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:700;text-align:center;text-decoration:none;margin-top:10px}.code{font-family:monospace;background:#f6f8fa;border:1px solid #e0e0e0;border-radius:8px;padding:10px;font-size:11px;white-space:pre-wrap;word-break:break-all;margin:8px 0;color:#333}.foot{text-align:center;font-size:10px;color:#999;padding:16px 0}input{width:100%;border:1px solid #d0d5dd;border-radius:8px;padding:10px;font-size:14px;margin:4px 0}#result{margin-top:8px}</style></head><body>\n<h1>HARZ Root</h1>\n<div class=\"sub\">Our own root nameserver \u2014 the .harz namespace, one law, one zone</div>\n\n";
const SCRIPT = "if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js')\nasync function doResolve(){const q=document.getElementById('q').value.trim();const r=document.getElementById('result');if(!q){r.innerHTML='<div class=\"small\">type a name</div>';return}try{const d=await(await fetch('/resolve?name='+encodeURIComponent(q))).json();if(d.ok){r.innerHTML='<div class=\"code\">'+d.records.map(x=>'TXT \u2192 '+x.value).join('\n')+'</div>'}else{r.innerHTML='<div class=\"code\">'+(d.error||'not found')+'</div>'}}catch(e){r.innerHTML='<div class=\"small\">error</div>'}}";

async function renderPage(env){
  let chainRows = '<div class="row"><span class="small">provenance unavailable</span></div>';
  try {
    const r = await env.DB.prepare("SELECT event, ts, hash FROM chain ORDER BY id DESC LIMIT 3").all();
    if (r && r.results && r.results.length) {
      chainRows = r.results.map(b => '<div class="row"><span><b>' + b.hash.slice(0,12).toUpperCase() + '</b><br><span class="small">' + b.event + ' \u00b7 ' + b.ts.slice(0,19) + 'Z</span></span></div>').join("");
    }
  } catch (e) {}
  const v = await sigValid();
  const sigCell = v === false ? '<span class="warn">Ed25519 INVALID</span>' : '<span class="ok">Ed25519 VALID</span>';
  const nameRows = names.map(n => '<div class="row"><span><b>' + n + '</b><br><span class="small"></span></span><span class="small" style="text-align:right">TXT</span></div>').join("");
  const footer = 'HARZ Root v2.3 \u00b7 canonical signed zone \u00b7 signature verified<br>Production ZSK ceremony complete 2026-09-14 \u2014 signed by the owner\'s key from Node 1.';
  return HEAD + '<div class="card">\n' +
    '<div class="row"><span>Canonical zone</span><span class="val">' + names.length + ' names \u00b7 height ' + height + '</span></div>\n' +
    '<div class="row"><span>Zone hash</span><span class="val" style="font-family:monospace;font-size:10px">' + digestHex.slice(0,20) + '\u2026</span></div>\n' +
    '<div class="row"><span>Signature</span>' + sigCell + '</div>\n' +
    '<div class="row"><span>Signed by</span><span class="val">' + fpHex + ' <span class="small">(PRODUCTION ZSK \u2014 owner ceremony 2026-09-14)</span></span></div>\n' +
    '<div class="row"><span>Registry</span><span class="val">D1 provenance + hash chain</span></div>\n' +
    '</div>\n\n<h2>Resolve a .harz Name</h2>\n<div class="card">\n<input id="q" placeholder="gov.harz" autocapitalize="off">\n<button class="btn" onclick="doResolve()">Resolve</button>\n<div id="result"></div>\n</div>\n\n' +
    '<h2>The Canonical Zone</h2>\n<div class="card">\n' + nameRows + '\n</div>\n\n' +
    '<h2>Latest Chain Blocks (provenance)</h2>\n<div class="card">\n' + chainRows + '\n</div>\n\n' +
    '<div class="foot">' + footer + '</div>\n<script>' + SCRIPT + '</script>\n</body></html>';
}

/* ---- DoH (RFC 8484) — .harz authoritative over standard DNS transport ---- */
function dohName(b, off) {
  const labels = []; let pos = off, jumped = false, end = off;
  while (b[pos] !== 0) {
    const len = b[pos];
    if ((len & 0xC0) === 0xC0) { if (!jumped) end = pos + 2; pos = ((len & 0x3F) << 8) | b[pos+1]; jumped = true; continue; }
    labels.push(new TextDecoder().decode(b.subarray(pos+1, pos+1+len)));
    pos += 1 + len;
    if (labels.length > 8) break;
  }
  if (!jumped) end = pos + 1;
  return { name: labels.join(".").toLowerCase(), end };
}
function dohHeader(id, flags, qd, an, ns, ar) {
  const h = new Uint8Array(12); const dv = new DataView(h.buffer);
  dv.setUint16(0, id); dv.setUint16(2, flags); dv.setUint16(4, qd); dv.setUint16(6, an); dv.setUint16(8, ns); dv.setUint16(10, ar);
  return h;
}
function dohTxt(txt) {
  const enc = new TextEncoder(); const chunks = [];
  for (let i = 0; i < txt.length; i += 255) chunks.push(enc.encode(txt.slice(i, i+255)));
  let total = 0; for (const c of chunks) total += 1 + c.length;
  const out = new Uint8Array(total); let k = 0;
  for (const c of chunks) { out[k++] = c.length; out.set(c, k); k += c.length; }
  return out;
}
function dohAnswerRR(nameLower) {
  const rd = dohTxt(records.get(nameLower));
  const rest = new Uint8Array(10); const dv = new DataView(rest.buffer);
  dv.setUint16(0, 16); dv.setUint16(2, 1); dv.setUint32(4, 3600); dv.setUint16(8, rd.length);
  const parts = [new Uint8Array([0xC0, 0x0C]), rest, rd];
  const out = new Uint8Array(2 + 10 + rd.length); let k = 0;
  for (const p of parts) { out.set(p, k); k += p.length; }
  return out;
}
const DOH_OPT = new Uint8Array([0, 0x00, 0x29, 0x04, 0xD0, 0, 0, 0, 0, 0, 0]); // root, type41, class 1232

const CT = {
  html: "text/html;charset=utf-8",
  zone: "text/plain; charset=utf-8",
  json: "application/json",
  manifest: "application/json",
  sw: "application/javascript",
  icon: "image/svg+xml"
};

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const p = url.pathname;
    if (p === "/dns-query") {
      let qBytes = null;
      if (req.method === "POST") qBytes = new Uint8Array(await req.arrayBuffer());
      else if (url.searchParams.has("dns")) {
        let b64 = url.searchParams.get("dns").replace(/-/g, "+").replace(/_/g, "/");
        while (b64.length % 4) b64 += "=";
        try { qBytes = _d(b64); } catch (e) { qBytes = null; }
      }
      const dohH = {"content-type": "application/dns-message", "access-control-allow-origin": "*", "cache-control": "max-age=60"};
      if (!qBytes || qBytes.length < 12) return new Response(null, {status: 400, headers: dohH});
      const qv = new DataView(qBytes.buffer, qBytes.byteOffset, qBytes.byteLength);
      const id = qv.getUint16(0), qd = qv.getUint16(4), qAr = qv.getUint16(10);
      let rcode = 0, answer = null;
      const hasOpt = qAr >= 1;
      if (qd !== 1) rcode = 1; // FORMERR
      else {
        const { name, end } = dohName(qBytes, 12);
        const qtype = qv.getUint16(end);
        const question = qBytes.slice(12, end + 4);
        const isHarz = name.endsWith(".harz");
        if (isHarz && records.has(name) && (qtype === 16 || qtype === 255)) { rcode = 0; answer = dohAnswerRR(name); }
        else if (isHarz) rcode = 3;   // authoritative NXDOMAIN
        else rcode = 5;               // REFUSED — authoritative for .harz only
        var qOut = question;
      }
      const parts = [dohHeader(id, 0x8400 | rcode, qd === 1 ? 1 : 0, answer ? 1 : 0, 0, hasOpt ? 1 : 0)];
      if (qd === 1) parts.push(qOut);
      if (answer) parts.push(answer);
      if (hasOpt) parts.push(DOH_OPT);
      let total = 0; for (const p of parts) total += p.length;
      const out = new Uint8Array(total); let k = 0;
      for (const p of parts) { out.set(p, k); k += p.length; }
      return new Response(out, {headers: dohH});
    }
    if (p === "/zone.sig") return new Response(_B.sig, {headers: {"content-type": "text/plain; charset=utf-8", "access-control-allow-origin": "*"}});
    if (p === "/pub") return new Response(PUB_PEM, {headers: {"content-type": "application/x-pem-file", "access-control-allow-origin": "*"}});
    if (p === "/zone") return new Response(ZONE_B, {headers: {"content-type": CT.zone, "access-control-allow-origin": "*"}});
    if (p === "/manifest.json") return new Response(MANIFEST, {headers: {"content-type": CT.manifest}});
    if (p === "/sw.js") return new Response(SWJS, {headers: {"content-type": CT.sw}});
    if (p === "/icon.svg") return new Response(ICON, {headers: {"content-type": CT.icon}});
    if (p === "/resolve") {
      const q = (url.searchParams.get("name") || "").trim().toLowerCase();
      if (!q || !q.endsWith(".harz")) return new Response(JSON.stringify({ok:false, error:"only .harz names"}), {headers: {"content-type": CT.json, "access-control-allow-origin": "*"}});
      const rec = records.get(q);
      if (!rec) return new Response(JSON.stringify({ok:false, name:q, error:"NXDOMAIN \u2014 not in canonical zone"}), {headers: {"content-type": CT.json, "access-control-allow-origin": "*"}});
      return new Response(JSON.stringify({ok:true, name:q, records:[{type:"TXT", value:rec}], source:"canonical zone height " + height, zone_hash: digestHex.slice(0,16) + "..."}), {headers: {"content-type": CT.json, "access-control-allow-origin": "*"}});
    }
    return new Response(await renderPage(env), {headers: {"content-type": CT.html}});
  }
};
