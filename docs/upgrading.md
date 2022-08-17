# Upgrading forms-flow-ai version 

This document contains useful information and a basic guide for upgrading the locally saved forms-flow-ai files with the ones from the source repo.

## Adding a remote upstream

The repository should already have the forms-flow-ai repository set as a remote upstream, allowing new branches to be pulled from it's origin.
However, in the event that the remote repository is ever disconnected for any reason, and needs to be re-added you can use the command:
`git remote add formsflow {url_to_repo}`.

From there, the usual fetch commands can be used to get new branches: `git fetch formsflow`

## Creating a merge branch 

from a new branch of the Digital-Journeys repository, you can issue the command `git merge {forms_flow_ai_target_branch} -s -recursive --allow-unrelated-histories`

This will begin a merge operation bringing in changes from the forms-flow-ai target branch into the current branch. 
Git may prompt you that certain files or folders are preventing the merge from occuring. Two culprits previously were:
`forms-flow-bpm/src/main/resources/mail-config.properties`
and
`forms-flow-forms/mongo_entrypoint/*`.
The recommended approach is to manually apply these files on-top of a completed merge, by moving them to a temporary directory, deleting them in the repository, and issuing the merge command as normal. These files should be reinstated at the end of the merge. The mongo_entrypoint folder should not contain any changes from the forms-flow repo, and mail-config.properties should always contain the current changes from the DGJ repo.

## Merging forms-flow-ai and DGJ overridden files

There will be numerous conflicts that need to be reconciled during the merge. These files will be any that have had custom work done on them during the history of the DGJ project. The goal is to update the file with the new forms-flow-ai changes first, and apply the custom DGJ implementations overtop. In some instances, the DGJ implementations may need to be updated to work with the new forms-flow-ai changes, however this should be addressed on a case-by-case basis during the regression testing process. For now, the most accurate way to accomplish this is to accept all changes from the forms-flow-ai incoming branch as a base, and add the custom DGJ implementations in on top. VSCode will show this as two side-by-side windows, one for each of the incoming branches, and a 'Result' window at the bottom. Click the '...' menu on the left window pane and select 'accept all changes', then using the checkboxes in the vertical margin between the two windows, manually select which changes from the right side DGJ file to apply overtop. the Result window should update to reflect the selections, and should show the forms-flow-ai file with just the DGJ changes added in. In some circumstances, the diff will not be clean and changes will be shown intersecting new code blocks, or be outside of a bracket pair. In these cases, it is perfectly acceptable to copy the target DGJ code, and paste it directly into the Results window in an acceptable spot.

For more complex files with less obvious differences between what was forms-flow-ai changes, and what was DGJ custom code, a manual inspection of both files can be done. for each of the highlighted blocks in both windows, you can view the file on the specific branch or tag in both the forms-flow-ai and DGJ repositories. By using the history functionality in the file source viewer, you can inspect each of the pieces of code and walk back through individual changes or additions and ensure you are only accepting the new updates and the DGJ implementation. This most commonly occurs when code has been removed from the forms-flow-ai repo since the last update due to deprecation or functionality change, or alternatively if a section of code has undergone simultaneous changes from both a forms-flow update and a DGJ change.

Once all conflicting files have been addressed this way, save all open files, stage the changes, and issue the command `git merge --continue`. The merge should finalize at this point and leave you with an unconflicted repository.

## Steps to validate the changes to the local build

Upon building the app, it is not uncommon to have a variety of compilation errors. These may need to be manually addressed, but by far the most common has been missing imports from the merge due to consistent changes in these areas of the files. It is also significantly more common to occur in the `forms-flow-bpm` subfolder than the `forms-flow-web` subfolder.

Once the application is building successfully, additional steps may need to be taken in the event that database changes were included in any of the updates.

### Mongodb 

The mongoDB disc might need to be reset. To do this, delete the `./mongodb` folder, and re-run the build. Docker exec into the running container, and cd to the `./script` folder. Run the resourceId_{your_OS-type}.bat with the command `./resourceId_{your_OS_type}.sh admin@example.com changeme`. Update the `./.env` file at the project root (not in the running container) with the keys provided by the file output.

### Postgres

TODO: figure out if migrations are even possible. might be worth to reset the posgres DB on local anyways, because if Mongo was reset it will orphan any Tasks left unfinished. Migration will need to be figured out for the prod environment however.
