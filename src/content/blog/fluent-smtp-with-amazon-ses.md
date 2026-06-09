---
title: "Fluent SMTP with Amazon SES won´t save"
description: "Simple solution: What a nightmare. I spent days and nights trying to find a solution. Fluent SMTP did not connect to SES with secret key credentials. The save b"
date: 2021-06-19
tags:
  - Allgemein
draft: false
---


Simple solution:
What a nightmare. I spent days and nights trying to find a solution. Fluent SMTP did not connect to SES with secret key credentials. The save button spinned and spinned. On Facebook someone gave me a tip: PHP 8.0 to PHP 7.4It worked immediately.Now FluentSMTP is able to send Mails over Amazon's SES Service. Thank goodness.
