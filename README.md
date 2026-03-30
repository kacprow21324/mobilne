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
* **Podgląd profili:** Możliwość kliknięcia w profil innego czytelnika, co otwiera modal lub ekran z listą wszystkich przeczytanych przez niego książek (tylko do odczytu, bez dostępu do cudzych notatek).
* **System obserwacji (Follow):** Możliwość dodawania użytkowników do obserwowanych oraz przeglądania osobnej listy śledzonych osób. Opcja usunięcia z listy w dowolnym momencie.
* **Szybkie dodawanie:** Przeglądając kolekcję obserwowanego użytkownika, można użyć przycisku "Dodaj do mojej listy" przy wybranej książce. System automatycznie kopiuje tytuł i autora, przypisuje książkę do konta zalogowanego użytkownika i nadaje jej status "Chcę przeczytać".

## Architektura i Ekrany

### Struktura Ekranów
1. **Login / Rejestracja** - Autoryzacja użytkowników w Supabase.
2. **MyBooks** - Główny panel z listą książek, wyszukiwarką, sortowaniem oraz licznikiem rocznym.
3. **AddBook** - Formularz dodawania i edycji pozycji.
4. **Statystyki** - Ekran agregujący dane o koncie.
5. **Obserwowani** - Lista śledzonych czytelników z możliwością wejścia w ich publiczne biblioteki.

### Zarządzanie Stanem (Zustand)
Store aplikacji jest utrzymany w minimalistycznej formie. Przechowuje wyłącznie informacje o globalnym kontekście użytkownika:
* `currentUser` - podstawowe dane aktualnie zalogowanej osoby.

### Baza Danych (Supabase)

Struktura bazy danych opiera się na trzech głównych tabelach relacyjnych.
