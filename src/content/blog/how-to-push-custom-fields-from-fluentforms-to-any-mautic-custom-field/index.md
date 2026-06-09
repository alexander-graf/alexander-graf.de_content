---
title: "How to push custom fields from FluentForms to any Mautic custom field"
summary: "What you need: The obvious things: Mautic InstallationFluentForm PluginFilezilla Mautic Fluent Integration: Like described herePlugin: here The short of it 1. C"
date: "2021-06-10"
tags:
- Allgemein
- custom fields
- integration
- push
draft: false
---

What you need:
The obvious things:
Mautic InstallationFluentForm PluginFilezilla
Mautic Fluent Integration:
Like described [here](https://wpmanageninja.com/docs/fluent-form/integrations-available-in-wp-fluent-form/mautic-integration-with-wp-fluent-forms/" target="_blank" rel="noopener)Plugin: [here](https://wordpress.org/plugins/mautic-for-fluent-forms/" target="_blank" rel="noopener)
The short of it
1. Create some Mautic custom fields. Alias will be needed later2. Open the file wp-content/plugins/mautic-for-fluent-forms/Integrations/Bootstrap.php from &#8220;Mautic Fluent Plugin&#8221; in your FTP3. Look around line 1384. Change entries as you wish5. Safe, upload6. Enjoy your new matching possibilities in your integration form.


**Bootstrap.php**public function otherFields()    {        // BIND STATIC CAUSE SOME FIELDS ARE NOT SUPPORTED        $attributes = [            &#8220;title&#8221; => &#8220;Title&#8221;,            &#8220;firstname&#8221; => &#8220;FirstName&#8221;,            &#8220;lastname&#8221; => &#8220;Last Name&#8221;,            &#8220;company&#8221; => &#8220;Company&#8221;,            &#8220;position&#8221; => &#8220;Position&#8221;,            &#8220;phone&#8221; => &#8220;Phone&#8221;,            &#8220;mobile&#8221; => &#8220;Mobile&#8221;,            &#8220;address1&#8221; => &#8220;Address1&#8221;,            &#8220;address2&#8221; => &#8220;Address2&#8221;,            &#8220;city&#8221; => &#8220;City&#8221;,            &#8220;zipcode&#8221; => &#8220;Zipcode&#8221;,            &#8220;country&#8221; => &#8220;Country&#8221;,            &#8220;fax&#8221; => &#8220;Fax&#8221;,            &#8220;website&#8221; => &#8220;Website&#8221;,            &#8220;facebook&#8221; => &#8220;Facebook&#8221;,            &#8220;foursquare&#8221; => &#8220;Foursquare&#8221;,            &#8220;googleplus&#8221; => &#8220;Googleplus&#8221;,            &#8220;instagram&#8221; => &#8220;Instagram&#8221;,            &#8220;linkedin&#8221; => &#8220;Linkedin&#8221;,            &#8220;skype&#8221; => &#8220;Skype&#8221;,            &#8220;twitter&#8221; => &#8220;Twitter&#8221;,           ** &#8220;betreff&#8221; => &#8220;Betreffzeile&#8221;,            &#8220;body&#8221; => &#8220;Mailbody&#8221;**                    ];        return $attributes;    }
