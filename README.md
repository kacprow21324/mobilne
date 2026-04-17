<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=D04A37" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-443322?style=for-the-badge&logo=react&logoColor=white" />
</div>

---
# Dziennik Czytelnika

Aplikacja mobilna służąca do zarządzania osobistą biblioteką książek. Projekt pozwala na śledzenie postępów w czytaniu, generowanie statystyk oraz interakcję z innymi użytkownikami poprzez funkcje społecznościowe.

## Główne Funkcjonalności

### Zarządzanie Zbiorem
* **Dodawanie pozycji:** Możliwość dodania książki z określeniem tytułu, autora, statusu, oceny (1-5) oraz własnych notatek.
* **Statusy:** Trzy wbudowane opcje wyboru: "Chcę przeczytać", "Czytam", "Przeczytane".
* **Wyszukiwanie i Sortowanie:** Proste wyszukiwanie tekstowe po tytule lub autorze. Sortowanie po statusie oraz dacie dodania (domyślnie od najnowszych).

### Statystyki
* Licznik przeczytanych książek w bieżącym roku na głównym widoku biblioteki.
* Osobny panel analityczny prezentujący:
    * Całkowitą liczbę posiadanych książek.
    * Liczbę książek ze statusem "Przeczytane" (ogółem oraz w bieżącym roku).
    * Średnią ocenę wszystkich przeczytanych książek.
    * Rozkład książek ze względu na przypisany status.
    * Najwyżej ocenioną książkę w kolekcji.

### Funkcje Społecznościowe
* **Kto przeczytał tę książkę?:** Widok szczegółów książki prezentuje listę użytkowników (ich loginy, oceny i daty), którzy posiadają tę samą pozycję (rozpoznawaną po tytule i autorze) ze statusem "Przeczytane". 
* **Podgląd profili:** Możliwość kliknięcia w profil innego czytelnika, co otwiera modal lub ekran z listą wszystkich przeczytanych przez niego książek.
* **System obserwacji (Follow):** Możliwość dodawania użytkowników do obserwowanych oraz przeglądania osobnej listy śledzonych osób.
* **Szybkie dodawanie:** Przeglądając kolekcję obserwowanego użytkownika, można użyć przycisku "Dodaj do mojej listy" przy wybranej książce.

## Architektura i Ekrany

### Struktura Ekranów
1. **Login / Rejestracja** - Autoryzacja użytkowników w Supabase.
2. **MyBooks** - Główny panel z listą książek, wyszukiwarką i licznikiem rocznym.
3. **AddBook** - Formularz dodawania i edycji pozycji.
4. **Statystyki** - Ekran agregujący dane o koncie.
5. **Obserwowani** - Lista śledzonych czytelników.

### Zarządzanie Stanem (Zustand)
Store aplikacji jest utrzymany w minimalistycznej formie. Przechowuje wyłącznie informacje o globalnym kontekście użytkownika:
* `currentUser` - podstawowe dane aktualnie zalogowanej osoby.

## Baza Danych (Supabase)

Struktura bazy danych opiera się na trzech głównych tabelach relacyjnych. Szczegółowy schemat powiązań został przedstawiony na poniższym diagramie:

<div align="center">
  <img src="dokumentacja/baza.png" alt="Schemat Bazy Danych" width="600" />
</div>

## Wygląd aplikacji 

<div align="center">
  <img src="dokumentacja/menu.png" alt="Menu Aplikacji" width="300" />
</div>
