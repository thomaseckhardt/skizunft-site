# Skizunft Kollnau – Ski School Booking

Website of the Skizunft Kollnau ski club. This context covers how people book ski and snowboard courses of the club's ski school and how the ski school team manages those bookings.

## Language

### Course catalog

**Course Offering** (UI: Kursangebot):
A bookable kind of course, defined by discipline, skill level, age range and price (regular and member price). Each course belongs to exactly one offering.
_Avoid_: Category, CourseCategory

**Course** (UI: Kurs):
A concrete, dated run of a course offering (e.g. "Ski Anfänger 1" on given dates) that an attendee can be booked onto.
_Avoid_: Course date, Termin, Kurstermin

**Discipline** (UI: Disziplin):
Ski or Snowboard.

**Skill Level** (UI: Könnensstufe):
How advanced the attendee is — Beginner, Junior Champion or Champion.

### Booking

**Booking** (UI: Buchung):
One submitted registration by a booker, covering one or more attendees and their chosen courses.
_Avoid_: Order, Anmeldung

**Booker** (UI: Buchende:r):
The person who submits a booking and is its contact (name, address, email, phone) — usually a parent.
_Avoid_: Customer, Kunde, Elternteil

**Attendee** (UI: Teilnehmer:in):
A person taking part in one or more courses within a booking. Usually a child, but adults can attend ski courses.
_Avoid_: Kind, Child, Participant

**Member** (UI: Vereinsmitglied):
An attendee who is a member of the club and therefore pays the member price.

**Order Number** (UI: Buchungsnummer):
The human-readable reference of a booking, shown to the booker and the ski school team.

**Discount Code** (UI: Rabattcode):
A code passed via link that reduces the total price of a booking by a fixed rate.

**Booking Flow** (UI: Buchungsstrecke):
The public sequence of steps a booker walks through, asking one piece of information per step.
_Avoid_: Booking form, Wizard

### Operations

**Ski School Team** (UI: Skischul-Team):
The club volunteers who organise courses and handle bookings via the admin area.

**Admin Area** (UI: Admin-Bereich):
The non-public part of the site where the ski school team views and manages bookings.
